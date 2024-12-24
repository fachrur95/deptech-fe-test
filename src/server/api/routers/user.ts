import axios from "axios";
import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PaginationResponse } from "~/types/pagination";
import type { IResponse } from "~/types/response";
import type { IUser } from "~/types/user";

const GLOBAL_URL = `${env.BACKEND_URL}/users`;

export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        birthDate: z.date(),
        password: z.string().min(1),
        gender: z.enum(["MALE", "FEMALE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await axios
        .post<IResponse<IUser>>(`${GLOBAL_URL}`, input, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${ctx.session.token.accessToken}`,
          },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          throw new Error(
            (error as { response: { data: { message: string } } }).response.data
              .message || "An error occurred",
          );
        });

      return result;
    }),

  findAll: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        page: z.union([z.string(), z.number()]).nullish(),
        search: z.string().nullish(),
        sort: z
          .object({
            field: z.string(),
            sort: z.enum(["asc", "desc"]).nullish().default("asc"),
          })
          .nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, search, sort } = input;

      let url = `${GLOBAL_URL}?page=${page ?? 1}&limit=${limit}`;

      if (search && search !== "") {
        url += `&search=${search}`;
      }

      if (sort?.field && sort.field !== "") {
        url += `&orderBy[name]=${sort.field}&orderBy[direction]=${sort.sort}`;
      }

      const result = await axios
        .get<IResponse<PaginationResponse<IUser>>>(url, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${ctx.session.token.accessToken}` },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);

          throw new Error(
            (error as { response: { data: { message: string } } }).response.data
              .message || "An error occurred",
          );
        });

      return result;
    }),

  findOne: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result: IResponse<IUser> = await axios
        .get<IResponse<IUser>>(`${GLOBAL_URL}/${input.id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${ctx.session.token.accessToken}` },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            (error as { response: { data: { message: string } } }).response.data
              .message || "An error occurred",
          );
        });

      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        birthDate: z.date(),
        password: z.string().min(1),
        currentPassword: z.string().min(1),
        gender: z.enum(["MALE", "FEMALE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await axios
        .patch<IResponse<IUser>>(`${GLOBAL_URL}/${id}`, data, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${ctx.session.token.accessToken}`,
          },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          throw new Error(
            (error as { response: { data: { message: string } } }).response.data
              .message || "An error occurred",
          );
        });

      return result;
    }),

  destroy: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await axios
        .delete<IResponse<IUser>>(`${GLOBAL_URL}/${input.id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${ctx.session.token.accessToken}`,
          },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          throw new Error(
            (error as { response: { data: { message: string } } }).response.data
              .message || "An error occurred",
          );
        });

      return result;
    }),
});
