import type { SaveState } from "@/features/onboarding/types";

import { AlertCircleIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";

const LABELS: Record<SaveState, string> = {
  idle: "يُحفظ تلقائياً",
  saving: "جارٍ الحفظ",
  saved: "تم الحفظ",
  error: "تعذر الحفظ",
};

export function SaveIndicator({ state }: { state: SaveState }) {
  const Icon =
    state === "saving"
      ? LoaderCircleIcon
      : state === "error"
        ? AlertCircleIcon
        : CheckIcon;

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <Icon
        aria-hidden
        className={state === "saving" ? "size-3.5 animate-spin" : "size-3.5"}
      />
      {LABELS[state]}
    </span>
  );
}
