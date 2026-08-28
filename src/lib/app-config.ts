/**
 * App-wide configuration. Arabic-first, RTL by default.
 * Keep this file tiny — feature-specific config lives in features.
 */

export const APP_NAME = "FlowPilot";
export const APP_DESCRIPTION =
  "نظام تحويل المواعيد عبر واتساب. حجز أكثر، متابعة أقل.";

export const HTML_LANG = "ar";
export const HTML_DIR = "rtl" as const;

export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

/** Main authenticated app navigation (generic — no vertical terminology). */
export const APP_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "الرئيسية", icon: "home" },
  { href: "/appointments", label: "المواعيد", icon: "calendar" },
  { href: "/conversations", label: "المحادثات", icon: "message" },
  { href: "/customers", label: "العملاء", icon: "users" },
];

/** Admin area navigation. */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "لوحة الإدارة", icon: "shield" },
];

/** Staff area navigation. */
export const STAFF_NAV_ITEMS: NavItem[] = [
  { href: "/staff", label: "لوحة الفريق", icon: "clipboard" },
];
