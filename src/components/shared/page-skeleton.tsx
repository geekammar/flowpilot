import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared skeleton pieces used by route `loading.tsx` files so every
 * screen shows a layout-matched placeholder instead of a blank page.
 */

export function PageHeaderSkeleton({
  withActions = false,
}: {
  withActions?: boolean;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      {withActions ? <Skeleton className="h-9 w-32 shrink-0" /> : null}
    </header>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32 max-w-full" />
        <Skeleton className="h-3 w-52 max-w-full" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

/** Screen-reader announcement for a loading route. */
export function LoadingAnnouncement({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}
