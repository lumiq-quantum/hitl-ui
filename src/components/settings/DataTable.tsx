
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  // ColumnFiltersState, // Not used for server-side filtering directly in table
  // getFilteredRowModel, // Not used for server-side filtering
  // getPaginationRowModel, // Not used for server-side pagination
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  onPageChange: (newPageIndex: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode; // For custom filter controls
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  onPageChange,
  canPreviousPage,
  canNextPage,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterComponent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // ColumnFiltersState is not managed here for server-side filtering
  // const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);


  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      // columnFilters, // Not for server-side
      pagination: { // Controlled pagination
        pageIndex,
        pageSize,
      }
    },
    manualPagination: true, // Crucial for server-side pagination
    // pageCount can be set if total number of items is known, otherwise -1 or undefined
    // For now, we rely on canNextPage prop from parent
    // manualFiltering: true, // If global filter is server-side
    manualSorting: false, // Keep client-side sorting for current page data, as API doesn't specify
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getFilteredRowModel: getFilteredRowModel(), // Not for server-side global filter
    // onColumnFiltersChange: setColumnFilters, // Not for server-side
    // getPaginationRowModel: getPaginationRowModel(), // Not for server-side
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {onSearchChange && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue || ""}
            onChange={(event) => onSearchChange(event.target.value)}
            className="max-w-sm w-full sm:w-auto"
          />
        )}
        {filterComponent && <div className="flex-grow w-full sm:w-auto">{filterComponent}</div>}
      </div>
      <ScrollArea className="rounded-md border whitespace-nowrap">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
