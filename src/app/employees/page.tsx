import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PaginationResponse } from "~/types/pagination";
import type { IEmployee } from "~/types/employee";

export default async function EmployeesPage() {
  const employees: PaginationResponse<IEmployee> = await api.employee.findAll({
    limit: 10,
  });
  const session = await auth();

  if (!session) {
    return redirect("/api/auth/signin");
  }
  if (!employees) {
    return <div className="container mx-auto py-10">Data Kosong</div>;
  }

  return (
    <HydrateClient>
      <div className="container mx-auto py-10">
        <DataTable
          total={employees.meta.total!}
          columns={columns}
          initialData={employees.data}
        />
      </div>
    </HydrateClient>
  );
}
