import {
  ListRowSkeleton,
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationsLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل صندوق المحادثات…" />
      <PageHeaderSkeleton />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_160px_160px]">
        <Skeleton className="col-span-2 h-9 w-full sm:col-span-1" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="divide-y">
            <ListRowSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
