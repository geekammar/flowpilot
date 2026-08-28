import { StatusBadge } from "@/components/shared/status-badge";
import type { ConversationStatus } from "@/types/domain";

const STATUS_LABELS: Record<ConversationStatus, string> = {
  AI_ACTIVE: "المساعد الذكي نشط",
  NEED_HUMAN: "يحتاج تدخلاً بشرياً",
  BOOKED: "محجوز",
  INCOMPLETE: "غير مكتملة",
};

export function ConversationStatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  const values = {
    AI_ACTIVE: "ai-active",
    NEED_HUMAN: "need-human",
    BOOKED: "booked",
    INCOMPLETE: "incomplete",
  } as const;

  return (
    <StatusBadge
      status={values[status]}
      aria-label={`حالة المحادثة: ${STATUS_LABELS[status]}`}
    />
  );
}
