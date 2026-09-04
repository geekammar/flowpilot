"use client";

import type {
  KnowledgeActionResult,
  KnowledgeEntryView,
} from "@/features/knowledge/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";

/**
 * Remove confirmation — one small destructive action, confirmed
 * explicitly so a mis-tap on mobile never deletes an entry silently.
 */
export function KnowledgeRemoveDialog({
  open,
  onOpenChange,
  entry,
  submit,
  onRemoved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The entry pending removal (present while the dialog is open). */
  entry: KnowledgeEntryView | null;
  /** Runs the actual server action (remove by current question). */
  submit: () => Promise<KnowledgeActionResult>;
  onRemoved: (entries: KnowledgeEntryView[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onConfirm() {
    if (!entry) return;
    setError(null);
    setSubmitting(true);
    const result = await submit();
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    onOpenChange(false);
    onRemoved(result.entries);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف المعلومة</DialogTitle>
          <DialogDescription>
            هتتم إزالة «{entry?.question}» نهائياً — المساعد مش هيستخدمها في
            الردود بعد كده.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={submitting}
          >
            {submitting ? <LoaderCircleIcon className="animate-spin" /> : null}
            حذف المعلومة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
