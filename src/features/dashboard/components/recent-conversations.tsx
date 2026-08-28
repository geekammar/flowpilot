import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { ConversationWithCustomer } from "@/types/domain";

import { ArrowUpLeftIcon, MessageCircleMoreIcon } from "lucide-react";
import Link from "next/link";

function conversationStatus(status: ConversationWithCustomer["status"]) {
  const values = {
    NEED_HUMAN: "need-human",
    AI_ACTIVE: "ai-active",
    BOOKED: "booked",
    INCOMPLETE: "incomplete",
  } as const;
  return values[status];
}

function relativeTime(date: Date | null, timeZone: string) {
  if (!date) return "محادثة جديدة";

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const messageDay = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const time = new Intl.DateTimeFormat("ar-EG", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return messageDay === today ? time : `آخر تواصل ${messageDay}`;
}

export function RecentConversations({
  conversations,
  timeZone,
}: {
  conversations: ConversationWithCustomer[];
  timeZone: string;
}) {
  return (
    <section aria-labelledby="recent-conversations-heading" className="min-w-0">
      <SectionHeader
        title="أحدث المحادثات"
        description="ابدأ بالحالات التي تحتاج تدخلك."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/conversations">
              فتح المحادثات
              <ArrowUpLeftIcon />
            </Link>
          </Button>
        }
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircleMoreIcon}
          title="لا توجد محادثات بعد"
          description="ستظهر هنا أحدث محادثات العملاء الواردة عبر واتساب."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/conversations">فتح المحادثات</Link>
            </Button>
          }
          className="bg-card py-10"
        />
      ) : (
        <ol className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/conversations/${conversation.id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {conversation.customer.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {relativeTime(conversation.lastMessageAt, timeZone)}
                  </p>
                </div>
                <StatusBadge status={conversationStatus(conversation.status)} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
