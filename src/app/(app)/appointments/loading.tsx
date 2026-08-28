import {
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل جدول المواعيد…" />
      <PageHeaderSkeleton withActions />

      <Skeleton className="h-20 w-full rounded-xl sm:h-[6.5rem]" />

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[3.4rem_minmax(0,1fr)] gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
          >
            <Skeleton className="h-8 w-14 justify-self-end" />
            <Skeleton className="h-24 w-full rounded-xl sm:h-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
