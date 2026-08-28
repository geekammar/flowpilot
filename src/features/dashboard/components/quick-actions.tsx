import { Button } from "@/components/ui/button";

import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  MessagesSquareIcon,
} from "lucide-react";
import Link from "next/link";

// Only destinations that exist today. Services & team management arrive
// with their own Spec A prompts.
const ACTIONS = [
  {
    href: "/appointments/new",
    label: "إنشاء موعد",
    icon: CalendarPlusIcon,
  },
  {
    href: "/conversations",
    label: "فتح المحادثات",
    icon: MessagesSquareIcon,
  },
  { href: "/appointments", label: "جدول اليوم", icon: CalendarDaysIcon },
] as const;

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-3">
      <h2 id="quick-actions-heading" className="sr-only">
        إجراءات سريعة
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              asChild
              variant={index === 0 ? "default" : "outline"}
              className="h-11 justify-start px-3"
            >
              <Link href={action.href}>
                <Icon aria-hidden />
                <span className="truncate">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
