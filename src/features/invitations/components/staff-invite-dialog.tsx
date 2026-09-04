"use client";

import { createStaffInvitationAction } from "@/features/invitations/actions/invitation-actions";
import {
  createStaffInvitationInputSchema,
  type CreateStaffInvitationInput,
} from "@/features/invitations/schemas/invitation-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  CopyIcon,
  LoaderCircleIcon,
  MailPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

/**
 * A pending STAFF invitation as handed back to the composing screen
 * (the team directory). Structurally compatible with the staff
 * feature's team-invitation shape — cross-feature types stay in their
 * own folders (composition happens at the route layer).
 */
export type CreatedStaffInvitation = {
  id: string;
  email: string;
  role: "STAFF";
  status: "PENDING";
  createdAt: string;
  expiresAt: string;
};

/** The activation route every invitation link points at. */
const INVITE_ROUTE = "/invite/";

function formatExpiry(iso: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/**
 * STAFF invitation creation dialog (PROMPT-16, team management): the
 * ONE canonical add-staff surface. Email-only input — the Business,
 * the STAFF role, and the inviter identity are all derived
 * server-side. On success the raw invitation link is displayed ONCE
 * (with a copy affordance) for manual delivery — it is never
 * persisted, never logged, and never shown again after this dialog
 * closes. No success state renders before the server confirms.
 */
export function StaffInviteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the ADMIN acknowledges the one-time link. */
  onCreated: (invitation: CreatedStaffInvitation) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState<CreatedStaffInvitation | null>(null);
  const form = useForm<CreateStaffInvitationInput>({
    resolver: zodResolver(createStaffInvitationInputSchema),
    defaultValues: { email: "" },
  });

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      // Clipboard unavailable — the link stays selectable for manual copy.
      setCopied(false);
    }
  }

  function closeAfterSuccess() {
    if (!created) return;
    onOpenChange(false);
    onCreated(created);
  }

  const submit = form.handleSubmit(async (data) => {
    setError(null);
    setSubmitting(true);
    let result: Awaited<ReturnType<typeof createStaffInvitationAction>>;
    try {
      result = await createStaffInvitationAction(data);
    } catch {
      result = {
        success: false,
        error: {
          code: "PERSISTENCE_FAILED",
          message: "تعذر إنشاء الدعوة الآن، حاول مرة أخرى",
        },
      };
    }
    setSubmitting(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    // The raw token is a credential returned exactly once — surface
    // the deliverable link now; it will never be retrievable again.
    const url = `${window.location.origin}${INVITE_ROUTE}${result.rawToken}`;
    setInviteUrl(url);
    setCreated({
      id: result.invitation.id,
      email: result.invitation.email,
      role: "STAFF",
      status: "PENDING",
      createdAt: result.invitation.createdAt.toISOString(),
      expiresAt: result.invitation.expiresAt.toISOString(),
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {created && inviteUrl ? (
          <div role="status" className="space-y-5">
            <DialogHeader>
              <DialogTitle>تم إنشاء الدعوة</DialogTitle>
              <DialogDescription>
                أرسل رابط الدعوة التالي إلى الموظف عبر واتساب أو أي وسيلة متاحة
                ليكمل تفعيل حسابه بنفسه.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
                <p
                  dir="ltr"
                  className="min-w-0 flex-1 truncate text-start text-xs leading-5"
                >
                  {inviteUrl}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyLink()}
                  aria-label="نسخ رابط الدعوة"
                >
                  {copied ? (
                    <CheckIcon aria-hidden className="size-4" />
                  ) : (
                    <CopyIcon aria-hidden className="size-4" />
                  )}
                  {copied ? "تم النسخ" : "نسخ"}
                </Button>
              </div>
              <p className="text-xs leading-5 text-destructive">
                لأسباب أمنية لن يظهر هذا الرابط مرة أخرى — انسخه الآن قبل
                الإغلاق.
              </p>
              <p className="text-muted-foreground text-xs leading-5">
                تنتهي صلاحية الدعوة في {formatExpiry(created.expiresAt)} إن لم
                يُكمل الموظف تفعيل حسابه.
              </p>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={closeAfterSuccess}
            >
              تم
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <DialogHeader>
              <DialogTitle>دعوة موظف</DialogTitle>
              <DialogDescription>
                أدخل بريد الموظف لإنشاء دعوة انضمام — سيصل الرابط إليه لتفعيل
                حسابه والانضمام إلى فريق منشأتك.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="staff-email">البريد الإلكتروني للموظف</Label>
              <Input
                id="staff-email"
                type="email"
                dir="ltr"
                autoComplete="off"
                placeholder="name@example.com"
                className="text-start"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

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
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <MailPlusIcon aria-hidden />
                )}
                {submitting ? "جارٍ الإنشاء…" : "إنشاء الدعوة"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
