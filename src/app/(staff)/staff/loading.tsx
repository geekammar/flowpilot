import {
  ListRowSkeleton,
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل مهامك…" />
      <PageHeaderSkeleton />

      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="divide-y">
            <ListRowSkeleton />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="divide-y">
            <ListRowSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
