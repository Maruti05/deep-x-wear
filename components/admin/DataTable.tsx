"use client";

/*
 * Generic shadcn DataTable wrapper
 * --------------------------------
 * • Accepts generic row type, columns (TanStack), data array
 * • Supports **server‑side pagination** via pageCount/currentPage/onPageChange
 * • Optional isLoading spinner overlay
 *
 * You can reuse this for orders, users, etc.
 *
 * Usage example is in the chat response below.
 */

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Settings2, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DataTableProps<TData extends object> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** total pages from server */
  pageCount: number;
  /** zero‑based current page */
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function DataTable<TData extends object>({
  columns,
  data,
  pageCount,
  currentPage,
  onPageChange,
  onSearch,
  searchPlaceholder,
  isLoading,
  className,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    pageCount,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const prevDisabled = currentPage === 0;
  const nextDisabled = currentPage + 1 >= pageCount;

  return (
    <div className={cn("relative space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Input
          placeholder={searchPlaceholder || "Filter Products..."}
          className="max-w-sm"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => {
            table.getColumn("name")?.setFilterValue(e.target.value);
            onSearch?.(e.target.value);
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead 
                    key={h.id} 
                    style={{ width: h.getSize() }}
                    className={h.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : h.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

        {/* Pagination controls */}
        <div className="flex items-center justify-end gap-4 border-t bg-muted/50 p-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={prevDisabled}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={nextDisabled}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
