import {
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewAppointmentLoading() {
  return (
    <div className="space-y-8">
      <LoadingAnnouncement label="جارٍ تحميل نموذج إنشاء الموعد…" />
      <PageHeaderSkeleton />
      <div className="rounded-xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  );
}
