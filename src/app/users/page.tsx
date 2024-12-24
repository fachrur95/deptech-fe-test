import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PaginationResponse } from "~/types/pagination";
import type { IUser } from "~/types/user";

export default async function UsersPage() {
  const users: PaginationResponse<IUser> = await api.user.findAll({
    limit: 10,
  });
  const session = await auth();

  if (!session) {
    return redirect("/api/auth/signin");
  }
  if (!users) {
    return <div className="container mx-auto py-10">Data Kosong</div>;
  }

  return (
    <HydrateClient>
      <div className="container mx-auto py-10">
        <DataTable
          total={users.meta.total!}
          columns={columns}
          initialData={users.data}
        />
      </div>
    </HydrateClient>
  );
}
