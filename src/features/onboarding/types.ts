export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; message: string };

export type OnboardingService = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type SaveState = "idle" | "saving" | "saved" | "error";
