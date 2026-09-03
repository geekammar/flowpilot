import type { NavItem } from "@/lib/app-config";

import {
  CalendarDays,
  ClipboardList,
  House,
  Layers,
  MessageCircle,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  home: House,
  calendar: CalendarDays,
  message: MessageCircle,
  users: Users,
  shield: Shield,
  clipboard: ClipboardList,
  layers: Layers,
};

export function getNavIcon(iconName: string): LucideIcon {
  return ICONS[iconName] ?? House;
}

export type { NavItem };
