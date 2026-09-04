import type { AppointmentStatus, ConversationStatus } from "@/types/domain";

/** The minimal created-customer payload handed back to callers. */
export type CustomerCreated = {
  id: string;
  name: string;
  phone: string;
};

/** Serializable customer row for the directory list. */
export type CustomerListItem = CustomerCreated & {
  lastConversationAt: string | null;
  lastAppointmentAt: string | null;
};

/** One appointment row inside the customer detail history. */
export type CustomerHistoryAppointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  service: { id: string; name: string; durationMinutes: number };
};

/** One conversation row inside the customer detail history. */
export type CustomerHistoryConversation = {
  id: string;
  status: ConversationStatus;
  lastActivityAt: string;
};

/** Serializable customer detail view (identity + full history). */
export type CustomerDetailData = CustomerListItem & {
  email: string | null;
  notes: string | null;
  createdAt: string;
  appointments: CustomerHistoryAppointment[];
  conversations: CustomerHistoryConversation[];
};

/**
 * Typed failure codes for customer creation so callers can react to
 * domain failures (duplicate phone above all) without parsing message
 * strings.
 */
export type CreateCustomerErrorCode =
  "VALIDATION" | "NO_BUSINESS" | "DUPLICATE_PHONE" | "CREATE_FAILED";

export type CreateCustomerActionResult =
  | { success: true; customer: CustomerListItem }
  | { success: false; code: CreateCustomerErrorCode; message: string };

export type CustomerSearchResult =
  | { success: true; customers: CustomerListItem[] }
  | { success: false; message: string };
