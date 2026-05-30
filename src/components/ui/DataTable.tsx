import { type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/api';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  meta?: PaginationMeta;
  loading?: boolean;
  sorting?: SortingState;
  onSortingChange?: (s: SortingState) => void;
  onPageChange?: (page: number) => void;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  meta,
  loading,
  sorting,
  onSortingChange,
  onPageChange,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: sorting ? { sorting } : undefined,
    onSortingChange: onSortingChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(sorting ?? []) : updater;
          onSortingChange(next);
        }
      : undefined,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-surface-2">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold text-content-muted"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="inline-flex items-center gap-1 hover:text-content"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-content-subtle">
                            {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '⇅'}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {columns.map((_c, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState ?? <EmptyState title="Nothing here yet" description="No records match your filters." />}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'border-b border-border transition-colors last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-surface-2',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-content">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && data.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-content-muted">
            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of{' '}
            {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrev}
              onClick={() => onPageChange?.(meta.page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-content-muted">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNext}
              onClick={() => onPageChange?.(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
