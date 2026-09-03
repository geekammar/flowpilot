export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; message: string };

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Server-computed summary shown on the review step (step 4/4). */
export type ReviewSummary = {
  businessName: string;
  verticalLabel: string;
  city: string;
  whatsappNumber: string;
  timezoneLabel: string;
  about: string | null;
  workingHours: Array<{
    key: string;
    label: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  slotDurationMinutes: number;
  cancellationPolicy: string;
};
