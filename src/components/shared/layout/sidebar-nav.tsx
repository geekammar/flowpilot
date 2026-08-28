"use client";

import { getNavIcon } from "@/components/shared/layout/nav-icons";
import { APP_NAME, type NavItem } from "@/lib/app-config";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label={APP_NAME} className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const Icon = getNavIcon(item.icon);
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)]",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
