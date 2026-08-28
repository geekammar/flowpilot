import { LoadingAnnouncement } from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationDetailLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <LoadingAnnouncement label="جارٍ تحميل المحادثة…" />
      <section className="flex h-[calc(100dvh-11rem)] min-h-[28rem] flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-xs lg:h-[calc(100dvh-8.5rem)]">
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Skeleton className="size-8 shrink-0 lg:hidden" />
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="h-3 w-28 max-w-full" />
          </div>
          <Skeleton className="h-5 w-24 shrink-0 rounded-full" />
        </header>
        <div className="flex flex-1 flex-col justify-end gap-3 bg-muted/30 px-3 py-5 sm:px-5">
          <Skeleton className="h-14 w-2/3 rounded-es-xl rounded-e-xl bg-card" />
          <Skeleton className="ms-auto h-10 w-1/2 rounded-ee-xl rounded-s-xl bg-accent" />
          <Skeleton className="h-14 w-3/5 rounded-es-xl rounded-e-xl bg-card" />
          <Skeleton className="ms-auto h-10 w-2/5 rounded-ee-xl rounded-s-xl bg-accent" />
        </div>
        <div className="border-t bg-card p-3 sm:p-4">
          <Skeleton className="h-11 w-full" />
        </div>
      </section>
    </div>
  );
}
