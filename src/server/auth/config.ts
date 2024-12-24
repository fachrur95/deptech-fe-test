import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { type DefaultSession, type NextAuthConfig, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.js";
import type { IResponse } from "~/types/response";
import type { IJwtDecode } from "~/types/session";
import type { ITokenLoginResponse } from "~/types/token";
import type { IUser } from "~/types/user";
import type { JWT } from "next-auth/jwt";
import { type AdapterUser } from "next-auth/adapters";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
    } & DefaultSession["user"];
    token: {
      accessToken: string;
      refreshToken: string;
    };
  }

  interface User {
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's role */
    accessToken: string;
    refreshToken: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      id: "next-auth",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@domain.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user: IResponse<ITokenLoginResponse> = await axios
          .post<IResponse<ITokenLoginResponse>>(
            `${env.BACKEND_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            },
          )
          .then((response) => response.data)
          .catch((error) => {
            throw new Error(
              ((error as IResponse<unknown>).error as string) ||
                "An error occurred",
            );
          });

        if (!user) {
          throw new Error("An error occurred");
        }

        const sessionData: IResponse<IUser> = await axios
          .get<IResponse<IUser>>(`${env.BACKEND_URL}/auth/session`, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${user.data.token.accessToken}`,
            },
          })
          .then((response) => response.data)
          .catch((error) => {
            throw new Error(
              ((error as IResponse<unknown>).error as string) ||
                "An error occurred",
            );
          });

        const session = jwtDecode<IJwtDecode>(user.data.token.accessToken);

        return {
          id: session.sub,
          email: session.email,
          name: sessionData.data.firstName,
          accessToken: user.data.token.accessToken,
          refreshToken: user.data.token.refreshToken,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          accessToken: session.user.accessToken,
          refreshToken: session.user.refreshToken,
        },
        accessToken: session.user.accessToken,
        refreshToken: session.user.refreshToken,
        token,
      };
    },
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user: User | AdapterUser;
      trigger?: "signIn" | "signUp" | "update";
    }) {
      if (trigger === "update") {
        return {
          ...token,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        };
      }
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
