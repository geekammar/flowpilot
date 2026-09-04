import {
  ListRowSkeleton,
  LoadingAnnouncement,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDetailLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل بيانات العميل…" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-40 max-w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24 shrink-0" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
          {Array.from({ length: 3 }, (_, index) => (
            <ListRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
