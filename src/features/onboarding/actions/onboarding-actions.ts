"use server";

import {
  bookingBasicsSchema,
  businessSetupSchema,
  workingHoursStepSchema,
} from "@/features/onboarding/schemas/onboarding-schema";
import { getOnboardingProgress } from "@/features/onboarding/server/onboarding-progress";
import type { ActionResult } from "@/features/onboarding/types";
import { requireUser } from "@/server/auth/guards";
import { businessRepository, userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

async function currentUser() {
  const session = await requireUser();
  return userRepository.findById(session.user.id);
}

function invalid<T = undefined>(
  message = "تحقق من البيانات وحاول مرة أخرى",
): ActionResult<T> {
  return { success: false, message };
}

function revalidateOnboarding() {
  revalidatePath("/onboarding", "layout");
}

/** Step 1 — بيانات المنشأة. Creates the Business on first save. */
export async function saveBusinessSetup(
  input: unknown,
): Promise<ActionResult<{ businessId: string }>> {
  const parsed = businessSetupSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user) return invalid("تعذر العثور على الحساب");

  const { about, ...rest } = parsed.data;
  const data = { ...rest, about: about ?? "" };

  try {
    const business = user.businessId
      ? await businessRepository.update(user.businessId, data)
      : await businessRepository.createForUser(user.id, data);

    revalidateOnboarding();
    return { success: true, data: { businessId: business.id } };
  } catch {
    return invalid("تعذر حفظ بيانات المنشأة الآن");
  }
}

/** Step 2 — ساعات العمل. */
export async function saveWorkingHours(input: unknown): Promise<ActionResult> {
  const parsed = workingHoursStepSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  try {
    await businessRepository.update(user.businessId, parsed.data);
    revalidateOnboarding();
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر حفظ مواعيد العمل الآن");
  }
}

/** Step 3 — إعدادات الحجز الأساسية. */
export async function saveBookingBasics(input: unknown): Promise<ActionResult> {
  const parsed = bookingBasicsSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  try {
    await businessRepository.update(user.businessId, parsed.data);
    revalidateOnboarding();
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر حفظ إعدادات الحجز الآن");
  }
}

/**
 * Step 4 — completion. Server-authoritative guard: the Business record must
 * hold valid data for all three setup steps before the completion timestamp
 * is written. Never trusts client state.
 */
export async function completeOnboarding(): Promise<ActionResult> {
  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  const business = await businessRepository.findById(user.businessId);
  if (!business) return invalid("تعذر العثور على المنشأة");

  const progress = getOnboardingProgress(business);
  if (
    !progress.businessValid ||
    !progress.hoursValid ||
    !progress.bookingValid
  ) {
    return invalid("أكمل جميع خطوات الإعداد قبل المتابعة");
  }

  try {
    await businessRepository.completeOnboarding(business.id);
    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر إكمال الإعداد الآن");
  }
}
