import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

export type DataTableColumn<TItem> = {
  id: string;
  header: string;
  /** Visually hidden on mobile, shown from sm and up. */
  hideBelowSm?: boolean;
  align?: "start" | "center" | "end";
  cell: (item: TItem) => React.ReactNode;
};

const alignClass = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const;

export function DataTable<TItem>({
  columns,
  items,
  rowKey,
  loading = false,
  loadingRows = 5,
  emptyIcon,
  emptyTitle = "لا توجد بيانات",
  emptyDescription,
  emptyAction,
  onRowClick,
  className,
}: {
  columns: DataTableColumn<TItem>[];
  items: TItem[];
  rowKey: (item: TItem) => string;
  loading?: boolean;
  loadingRows?: number;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: TItem) => void;
  className?: string;
}) {
  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyAction ? (
            typeof emptyAction === "string" ? (
              <Button>{emptyAction}</Button>
            ) : (
              emptyAction
            )
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  aria-hidden={column.hideBelowSm ? true : undefined}
                  className={cn(
                    alignClass[column.align ?? "start"],
                    column.hideBelowSm && "hidden sm:table-cell",
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: loadingRows }, (_, index) => (
                  <TableRow key={`skeleton-${String(index)}`}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.hideBelowSm && "hidden sm:table-cell",
                        )}
                      >
                        <Skeleton className="h-4 w-full max-w-28" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : items.map((item) => (
                  <TableRow
                    key={rowKey(item)}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(item);
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      onRowClick && "cursor-pointer focus-visible:bg-muted",
                    )}
                    aria-selected={undefined}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          alignClass[column.align ?? "start"],
                          column.hideBelowSm && "hidden sm:table-cell",
                        )}
                      >
                        {column.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
