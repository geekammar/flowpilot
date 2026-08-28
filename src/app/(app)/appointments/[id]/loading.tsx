import { LoadingAnnouncement } from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentDetailLoading() {
  return (
    <div className="space-y-6">
      <LoadingAnnouncement label="جارٍ تحميل تفاصيل الموعد…" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-48 max-w-full" />
          <Skeleton className="h-3.5 w-56 max-w-full" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
