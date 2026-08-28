import {
  ListRowSkeleton,
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل دليل العملاء…" />
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
        {Array.from({ length: 5 }, (_, index) => (
          <ListRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
