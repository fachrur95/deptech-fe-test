import axios from "axios";
import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { IEmployee } from "~/types/employee";
import type { PaginationResponse } from "~/types/pagination";
import type { IResponse } from "~/types/response";

const GLOBAL_URL = `${env.BACKEND_URL}/employees`;

export const employeeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        gender: z.enum(["MALE", "FEMALE"]),
        email: z.string().email(),
        address: z.string().nullish(),
        phoneNumber: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await axios
        .post<IResponse<IEmployee>>(`${GLOBAL_URL}`, input, {
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

      const result: PaginationResponse<IEmployee> = await axios
        .get<IResponse<PaginationResponse<IEmployee>>>(url, {
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
      const result: IResponse<IEmployee> = await axios
        .get<IResponse<IEmployee>>(`${GLOBAL_URL}/${input.id}`, {
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
        gender: z.enum(["MALE", "FEMALE"]),
        email: z.string().email(),
        address: z.string().nullish(),
        phoneNumber: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await axios
        .patch<IResponse<IEmployee>>(`${GLOBAL_URL}/${id}`, data, {
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
        .delete<IResponse<IEmployee>>(`${GLOBAL_URL}/${input.id}`, {
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
