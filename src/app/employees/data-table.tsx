"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { PaginationResponse } from "~/types/pagination";
import type { IEmployee } from "~/types/employee";
import { api } from "~/trpc/react";
import Link from "next/link";
import { toast } from "~/hooks/use-toast";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  total: number;
  initialData: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  initialData,
  total,
}: Readonly<DataTableProps<TData, TValue>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rows, setRows] = useState<TData[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{
    column: string;
    direction: "asc" | "desc";
  }>({ column: "", direction: "asc" });

  const { refetch, isFetching, data } = api.employee.findAll.useQuery(
    {
      limit: 10,
      page: currentPage,
      search,
      sort: {
        field: sort.column,
        sort: sort.direction,
      },
    },
    {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleSort = async (column: string) => {
    const direction =
      sort.column === column && sort.direction === "asc" ? "desc" : "asc";
    setSort({ column, direction });
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
  };

  const mutationDelete = api.employee.destroy.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      toast({
        title: "Error message:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{error.shape?.message}</code>
          </pre>
        ),
      });
    },
  });

  const handleDelete = (id: number) => {
    try {
      mutationDelete.mutate({ id });
      alert("Employee berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Gagal menghapus employee.");
    }
  };

  const updatedColumns = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        meta: { onDelete: handleDelete },
      };
    }
    return col;
  });

  const table = useReactTable({
    data: rows,
    columns: updatedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
    pageCount: Math.ceil(total / 10),
  });

  useEffect(() => {
    if (data) {
      const dataResponse = data as unknown as PaginationResponse<IEmployee>;
      const dataRows = dataResponse.data;
      setRows(dataRows as TData[]);
    }
  }, [data]);

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter or search..."
          value={search}
          onChange={handleSearch}
          className="max-w-sm"
        />
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/employees/new"
        >
          Add New
        </Link>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => handleSort(header.id)}
                      className="cursor-pointer"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= Math.ceil(total / 10) || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
