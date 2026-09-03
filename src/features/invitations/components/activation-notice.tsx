import { ACTIVATION_SIGNIN_HANDOFF } from "@/features/invitations/types";
import type { ActivationNoticeState } from "@/features/invitations/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  BanIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  ShieldAlertIcon,
  UserXIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

/**
 * Terminal state panel for the ADMIN activation screen (PROMPT-06).
 * Server-renderable (page pre-screen) and client-renderable
 * (post-submit states) — every state maps to one calm Arabic panel
 * with no internals exposed. Recovery actions stay within the app:
 * sign-in for already-activated accounts, operator contact otherwise.
 */

type NoticeDefinition = {
  icon: LucideIcon;
  tone: "neutral" | "success" | "error";
  title: string;
  description: string;
};

const NOTICE_DEFINITIONS: Record<ActivationNoticeState, NoticeDefinition> = {
  INVALID_TOKEN: {
    icon: CircleXIcon,
    tone: "error",
    title: "رابط الدعوة غير صالح",
    description:
      "هذا الرابط غير صحيح أو لا يمكن استخدامه. تواصل مع من دعاك للحصول على رابط جديد.",
  },
  EXPIRED: {
    icon: ClockIcon,
    tone: "error",
    title: "انتهت صلاحية الدعوة",
    description:
      "انتهت مدة صلاحية رابط الدعوة. تواصل مع من دعاك لإرسال دعوة جديدة.",
  },
  REVOKED: {
    icon: BanIcon,
    tone: "error",
    title: "تم إلغاء الدعوة",
    description: "تم إلغاء هذه الدعوة. تواصل مع من دعاك للمزيد من التفاصيل.",
  },
  ALREADY_ACTIVATED: {
    icon: CircleCheckIcon,
    tone: "success",
    title: "الحساب مفعّل بالفعل",
    description: "تم تفعيل هذا الحساب سابقاً. يمكنك تسجيل الدخول مباشرة.",
  },
  ROLE_NOT_ALLOWED: {
    icon: UserXIcon,
    tone: "neutral",
    title: "دعوة غير مدعومة",
    description:
      "هذه الدعوة مخصصة لأعضاء الفريق، وتفعيل حسابات الفريق غير متاح حالياً.",
  },
  CONFLICT: {
    icon: ShieldAlertIcon,
    tone: "error",
    title: "تعذر تفعيل الحساب",
    description:
      "هذا البريد مرتبط بحساب آخر. تواصل مع من دعاك إذا كنت تعتقد أن هناك خطأ.",
  },
  FAILED: {
    icon: CircleAlertIcon,
    tone: "error",
    title: "حدث خطأ",
    description: "تعذر إتمام التفعيل الآن، حاول مرة أخرى لاحقاً.",
  },
};

const TONE_STYLES: Record<NoticeDefinition["tone"], string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
};

export function ActivationNotice({
  state,
  message,
  className,
}: {
  state: ActivationNoticeState;
  /** Safe Arabic service message — shown instead of the default copy. */
  message?: string;
  className?: string;
}) {
  const definition = NOTICE_DEFINITIONS[state];
  const Icon = definition.icon;
  const description = message?.trim() || definition.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-6 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          TONE_STYLES[definition.tone],
        )}
      >
        <Icon aria-hidden className="size-5" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {definition.title}
        </h2>
        <p className="text-muted-foreground mx-auto max-w-xs text-sm leading-6">
          {description}
        </p>
      </div>
      {state === "ALREADY_ACTIVATED" ? (
        <Button asChild className="mt-1">
          <Link href={ACTIVATION_SIGNIN_HANDOFF}>تسجيل الدخول</Link>
        </Button>
      ) : null}
    </div>
  );
}
