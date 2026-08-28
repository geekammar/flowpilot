"use server";

import {
  availabilitySchema,
  businessSetupSchema,
  knowledgeSchema,
  serviceFormSchema,
} from "@/features/onboarding/schemas/onboarding-schema";
import type { ActionResult } from "@/features/onboarding/types";
import { uuidSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import {
  businessRepository,
  serviceRepository,
  userRepository,
} from "@/server/repositories";

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

export async function saveBusinessSetup(
  input: unknown,
): Promise<ActionResult<{ businessId: string }>> {
  const parsed = businessSetupSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user) return invalid("تعذر العثور على الحساب");

  try {
    const business = user.businessId
      ? await businessRepository.update(user.businessId, parsed.data)
      : await businessRepository.createForUser(user.id, parsed.data);

    revalidatePath("/onboarding");
    return { success: true, data: { businessId: business.id } };
  } catch {
    return invalid("تعذر حفظ بيانات المنشأة الآن");
  }
}

export async function createService(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  try {
    const service = await serviceRepository.create({
      businessId: user.businessId,
      ...parsed.data,
    });
    revalidatePath("/onboarding/services");
    return { success: true, data: { id: service.id } };
  } catch {
    return invalid("تعذر إضافة الخدمة الآن");
  }
}

export async function updateService(
  id: unknown,
  input: unknown,
): Promise<ActionResult> {
  const parsedId = uuidSchema.safeParse(id);
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) return invalid();

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  const service = await serviceRepository.findById(parsedId.data);
  if (!service || service.businessId !== user.businessId) {
    return invalid("الخدمة غير موجودة");
  }

  try {
    await serviceRepository.update(service.id, parsed.data);
    revalidatePath("/onboarding/services");
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر تعديل الخدمة الآن");
  }
}

export async function deleteService(id: unknown): Promise<ActionResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return invalid("الخدمة غير موجودة");

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  const service = await serviceRepository.findById(parsedId.data);
  if (!service || service.businessId !== user.businessId) {
    return invalid("الخدمة غير موجودة");
  }

  try {
    await serviceRepository.softDelete(service.id);
    revalidatePath("/onboarding/services");
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر حذف الخدمة الآن");
  }
}

export async function saveAvailability(input: unknown): Promise<ActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  try {
    await businessRepository.update(user.businessId, parsed.data);
    revalidatePath("/onboarding/availability");
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر حفظ مواعيد العمل الآن");
  }
}

export async function saveKnowledge(input: unknown): Promise<ActionResult> {
  const parsed = knowledgeSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);

  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  try {
    await businessRepository.update(user.businessId, parsed.data);
    revalidatePath("/onboarding/knowledge");
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر حفظ معلومات المنشأة الآن");
  }
}

export async function completeOnboarding(): Promise<ActionResult> {
  const user = await currentUser();
  if (!user?.businessId) return invalid("أكمل بيانات المنشأة أولاً");

  const [business, services] = await Promise.all([
    businessRepository.findById(user.businessId),
    serviceRepository.listByBusiness(user.businessId),
  ]);
  if (!business) return invalid("تعذر العثور على المنشأة");

  const businessValid = businessSetupSchema.safeParse(business).success;
  const availabilityValid = availabilitySchema.safeParse({
    workingHours: business.workingHours,
    slotDurationMinutes: business.slotDurationMinutes,
  }).success;
  const knowledgeValid = knowledgeSchema.safeParse({
    about: business.about,
    faqs: business.faqs,
    cancellationPolicy: business.cancellationPolicy,
  }).success;

  if (!businessValid || !availabilityValid || !knowledgeValid) {
    return invalid("أكمل جميع خطوات الإعداد قبل المتابعة");
  }
  if (services.length === 0) return invalid("أضف خدمة واحدة على الأقل");

  try {
    await businessRepository.completeOnboarding(business.id);
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch {
    return invalid("تعذر إكمال الإعداد الآن");
  }
}
