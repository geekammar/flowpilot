import {
  ListRowSkeleton,
  LoadingAnnouncement,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل الفريق…" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-32 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24 shrink-0" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }, (_, index) => (
          <ListRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
