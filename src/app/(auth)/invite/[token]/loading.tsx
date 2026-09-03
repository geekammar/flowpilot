import { Skeleton } from "@/components/ui/skeleton";

export default function InviteActivationLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="space-y-1.5 text-center">
        <Skeleton className="mx-auto h-6 w-32" />
        <Skeleton className="mx-auto h-4 w-52" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
