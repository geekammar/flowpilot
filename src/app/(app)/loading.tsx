import {
  ListRowSkeleton,
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeleton";
import { StatCardSkeleton } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <LoadingAnnouncement label="جارٍ تحميل لوحة اليوم…" />
      <PageHeaderSkeleton />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: 4 }, (_, index) => (
              <ListRowSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: 3 }, (_, index) => (
              <ListRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
