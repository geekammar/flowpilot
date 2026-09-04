"use client";

import {
  createKnowledgeEntryAction,
  removeKnowledgeEntryAction,
  updateKnowledgeEntryAction,
} from "@/features/knowledge/actions/knowledge-actions";
import { KnowledgeFormDialog } from "@/features/knowledge/components/knowledge-form-dialog";
import { KnowledgeRemoveDialog } from "@/features/knowledge/components/knowledge-remove-dialog";
import type { KnowledgeEntryView } from "@/features/knowledge/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { KNOWLEDGE_NOUNS, arabicCount } from "@/lib/arabic";

import {
  BookOpenIcon,
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

/**
 * Business Knowledge screen (PROMPT-18): what the future AI assistant
 * knows. The mental model is one line — هذه المعلومات هي التي
 * سيستخدمها المساعد الذكي للرد على العملاء — then a plain list of
 * question/answer entries with one primary action (إضافة معلومة), a
 * small edit dialog, and a confirmed remove. Mutation failures
 * surface inside their dialog (role="alert"); server-confirmed
 * results replace the whole list, so the screen never drifts from
 * the stored JSON entries.
 */
export function KnowledgeScreen({
  initialEntries,
}: {
  initialEntries: KnowledgeEntryView[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntryView | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [removing, setRemoving] = useState<KnowledgeEntryView | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormSession((count) => count + 1);
    setFormOpen(true);
  }

  function openEdit(entry: KnowledgeEntryView) {
    setEditing(entry);
    setFormSession((count) => count + 1);
    setFormOpen(true);
  }

  function openRemove(entry: KnowledgeEntryView) {
    setRemoving(entry);
    setRemoveOpen(true);
  }

  /** A server-confirmed save replaces the list and confirms calmly. */
  function handleSaved(list: KnowledgeEntryView[]) {
    setEntries(list);
    setSuccess("تم حفظ المعلومة");
  }

  /** A server-confirmed remove replaces the list and confirms calmly. */
  function handleRemoved(list: KnowledgeEntryView[]) {
    setEntries(list);
    setRemoving(null);
    setSuccess("تم حذف المعلومة");
  }

  const submitForm = editing
    ? (input: { question: string; answer: string }) =>
        updateKnowledgeEntryAction({
          currentQuestion: editing.question,
          entry: input,
        })
    : createKnowledgeEntryAction;

  const submitRemove = () =>
    removing
      ? removeKnowledgeEntryAction({ question: removing.question })
      : Promise.resolve({
          success: false,
          message: "لا توجد معلومة محددة للحذف",
        } as const);

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="معلومات للمساعد"
        description="هذه المعلومات هي التي سيستخدمها المساعد الذكي للرد على العملاء — خليها دقيقة ومحدّثة."
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            إضافة معلومة
          </Button>
        }
      />

      {entries.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {arabicCount(entries.length, KNOWLEDGE_NOUNS)}
          </p>
          {success ? (
            <p
              role="status"
              className="flex items-center gap-1.5 text-sm text-success"
            >
              <CheckCircleIcon aria-hidden className="size-4" />
              {success}
            </p>
          ) : null}
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.question}>
                <article className="rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-semibold">{entry.question}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {entry.answer}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(entry)}
                      >
                        <PencilIcon />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openRemove(entry)}
                      >
                        <TrashIcon />
                        حذف
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          className="bg-card min-h-72"
          icon={BookOpenIcon}
          title="لسه ما أضفتش معلومات للمساعد"
          description="أضف الأسعار أو السياسات أو الإجابات المتكررة عشان المساعد يقدر يرد بدقة."
          action={
            <Button size="sm" onClick={openCreate}>
              <PlusIcon aria-hidden className="size-4" />
              إضافة معلومة
            </Button>
          }
        />
      )}

      {/* key → the dialog remounts on every open, so create starts
          blank and edit prefills the selected entry. */}
      <KnowledgeFormDialog
        key={formSession}
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editing ?? undefined}
        submit={submitForm}
        onSaved={handleSaved}
      />

      <KnowledgeRemoveDialog
        open={removeOpen}
        onOpenChange={(open) => {
          setRemoveOpen(open);
          if (!open) setRemoving(null);
        }}
        entry={removing}
        submit={submitRemove}
        onRemoved={handleRemoved}
      />
    </div>
  );
}
