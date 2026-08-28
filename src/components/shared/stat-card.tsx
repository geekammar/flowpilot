import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

const deltaTone = {
  positive: "text-success",
  negative: "text-error",
  neutral: "text-muted-foreground",
} as const;

export function StatCard({
  label,
  value,
  delta,
  deltaTone: tone = "neutral",
  icon: Icon,
  loading = false,
  className,
}: {
  label: string;
  value: string | number;
  /** Short change indicator, e.g. "+12%" or "-3". */
  delta?: string;
  deltaTone?: keyof typeof deltaTone;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1.5">
          <p className="text-muted-foreground truncate text-sm">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
          )}
          {delta ? (
            <p className={cn("text-xs font-medium", deltaTone[tone])}>
              {delta}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Icon aria-hidden className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return <StatCard label="" value="" loading className={className} />;
}
