import type { AppointmentStatus } from "@/types/domain";

export type AppointmentAgendaItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  customer: { id: string; name: string; phone: string };
  service: { id: string; name: string; durationMinutes: number };
};

export type AppointmentDetailData = AppointmentAgendaItem & {
  conversationId: string | null;
};

export type AppointmentActionResult =
  | { success: true; appointmentId?: string }
  | { success: false; message: string };

/**
 * Smart Create Appointment flow (PROMPT-11 — Steps 1–3 foundation).
 *
 * The intended flow is 6 steps — العميل → الخدمة → التاريخ → الوقت →
 * المراجعة → التأكيد — but only the first 3 are implemented in this
 * prompt; steps 4–6 stay locked in the UI. `BOOKING_FLOW_ACTIVE_STEPS`
 * marks the boundary so the progress indicator (and tests) share one
 * source of truth.
 */
export const BOOKING_FLOW_STEPS = [
  { label: "العميل" },
  { label: "الخدمة" },
  { label: "التاريخ" },
  { label: "الوقت" },
  { label: "المراجعة" },
  { label: "التأكيد" },
] as const;

export const BOOKING_FLOW_ACTIVE_STEPS = 3 as const;

/** Wizard screen — `details` is the interim completion screen (time +
 * note + create through the existing action), NOT one of the 6 flow
 * steps; PROMPT-12 replaces it with available-slot selection. */
export type BookingFlowScreen = "customer" | "service" | "date" | "details";

/** Customer option for the booking flow (searchable by name/phone). */
export type BookingCustomerOption = {
  id: string;
  name: string;
  phone: string;
};

/** Active service option for the booking flow. */
export type BookingServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type BookingCustomerSearchResult =
  | { success: true; customers: BookingCustomerOption[] }
  | { success: false; message: string };

/**
 * Availability result contract (PROMPT-10).
 *
 * One small typed contract answering: "For this Business, on this date,
 * for this active Service, which start times are actually bookable?"
 *
 * - `slots` are business-local wall-clock "HH:mm" start times — the
 *   exact format appointments persist (`@db.Time`) and the existing
 *   Create Appointment form consumes. Times are interpreted in the
 *   Business's stored timezone; the device/browser timezone is never a
 *   source of truth.
 * - Empty availability is EXPLICIT (`reason: NO_SLOTS`), never an
 *   empty array without explanation.
 * - Errors are typed codes with Arabic messages — no internal
 *   database details leak into the shape.
 * - The calculation is deterministic: repeated calls with the same
 *   persisted state produce the same result (no `Date.now()` in the
 *   slot-calculation path).
 */

/** A single bookable start time (business-local "HH:mm"). */
export type AvailabilitySlot = {
  /** Slot start time — "HH:mm" 24h, business-local wall clock. */
  startTime: string;
  /** Slot end time — start + Service.durationMinutes, "HH:mm". */
  endTime: string;
};

export type AvailabilityData = {
  /** Requested business date ("YYYY-MM-DD"), echoed back verbatim. */
  date: string;
  /** Business timezone the times are interpreted in. */
  timezone: string;
  /** The service whose duration produced the slots. */
  serviceId: string;
  serviceDurationMinutes: number;
  /** Bookable start times, ascending, chronologically ordered. */
  slots: AvailabilitySlot[];
};

/** Why zero slots exist — present ONLY when `slots` is empty. */
export type AvailabilityNoSlotsReason =
  "BUSINESS_CLOSED" | "SERVICE_TOO_LONG" | "FULLY_BOOKED";

export type AvailabilityErrorCode =
  | "INVALID_INPUT"
  | "FORBIDDEN"
  | "NO_BUSINESS"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_INACTIVE";

export type AvailabilityResult =
  | {
      success: true;
      data: AvailabilityData;
      reason: AvailabilityNoSlotsReason | null;
    }
  | {
      success: false;
      error: { code: AvailabilityErrorCode; message: string };
    };
