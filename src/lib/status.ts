import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CalendarCheck2,
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  Clock,
  Headset,
  Info,
  TriangleAlert,
  UserX,
} from "lucide-react";

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral";

export type StatusValue =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no-show"
  | "completed"
  | "need-human"
  | "ai-active"
  | "booked"
  | "incomplete";

export type StatusDefinition = {
  value: StatusValue;
  /** Arabic label — UI is Arabic-first. */
  labelAr: string;
  tone: StatusTone;
  icon: LucideIcon;
};

export const STATUSES: Record<StatusValue, StatusDefinition> = {
  success: {
    value: "success",
    labelAr: "ناجح",
    tone: "success",
    icon: CircleCheck,
  },
  warning: {
    value: "warning",
    labelAr: "تحذير",
    tone: "warning",
    icon: TriangleAlert,
  },
  error: {
    value: "error",
    labelAr: "خطأ",
    tone: "error",
    icon: CircleX,
  },
  info: {
    value: "info",
    labelAr: "معلومة",
    tone: "info",
    icon: Info,
  },
  pending: {
    value: "pending",
    labelAr: "قيد الانتظار",
    tone: "warning",
    icon: Clock,
  },
  confirmed: {
    value: "confirmed",
    labelAr: "مؤكد",
    tone: "success",
    icon: CalendarCheck2,
  },
  cancelled: {
    value: "cancelled",
    labelAr: "ملغي",
    tone: "neutral",
    icon: CircleX,
  },
  "no-show": {
    value: "no-show",
    labelAr: "لم يحضر",
    tone: "error",
    icon: UserX,
  },
  completed: {
    value: "completed",
    labelAr: "مكتمل",
    tone: "success",
    icon: CircleCheck,
  },
  "need-human": {
    value: "need-human",
    labelAr: "يحتاج تدخلاً بشرياً",
    tone: "error",
    icon: Headset,
  },
  "ai-active": {
    value: "ai-active",
    labelAr: "المساعد الذكي نشط",
    tone: "info",
    icon: Bot,
  },
  booked: {
    value: "booked",
    labelAr: "محجوز",
    tone: "success",
    icon: CalendarCheck2,
  },
  incomplete: {
    value: "incomplete",
    labelAr: "غير مكتملة",
    tone: "warning",
    icon: CircleQuestionMark,
  },
};

export const STATUS_LIST = Object.values(STATUSES);

/** Resolve a status safely; unknown values fall back to a neutral info chip. */
export function resolveStatus(value: string): StatusDefinition {
  return (
    STATUSES[value as StatusValue] ?? {
      value: "info",
      labelAr: value,
      tone: "neutral",
      icon: CircleQuestionMark,
    }
  );
}
