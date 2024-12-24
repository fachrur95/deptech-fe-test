import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PaginationResponse } from "~/types/pagination";
import type { ILeave } from "~/types/leave";

export default async function LeavesPage() {
  const leaves: PaginationResponse<ILeave> = await api.leave.findAll({
    limit: 10,
  });
  const session = await auth();

  if (!session) {
    return redirect("/api/auth/signin");
  }
  if (!leaves) {
    return <div className="container mx-auto py-10">Data Kosong</div>;
  }

  return (
    <HydrateClient>
      <div className="container mx-auto py-10">
        <DataTable
          total={leaves.meta.total!}
          columns={columns}
          initialData={leaves.data}
        />
      </div>
    </HydrateClient>
  );
}
