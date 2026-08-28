/**
 * FlowPilot seed — realistic Arabic demo data (dental-vertical demo
 * only for local discovery; the product itself stays vertical-agnostic).
 *
 * Run with: pnpm db:seed
 * Requires a reachable DATABASE_URL. Idempotent: wipes demo rows first.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

import "dotenv/config";

function makeDb(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "❌ DATABASE_URL غير معرّف. انسخ .env.example إلى .env وضع قيمة صحيحة.",
    );
    process.exit(1);
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const prisma = makeDb();

const BUSINESS_TIMEZONE = "Asia/Riyadh";

/** "YYYY-MM-DD" from today + offset days, in the business timezone. */
function dateIn(days: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month, day] = parts.split("-").map(Number);
  const target = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  target.setUTCDate(target.getUTCDate() + days);
  return target.toISOString().slice(0, 10);
}

async function main() {
  console.log("🌱 بدء تعبئة البيانات التجريبية…");

  // ── Wipe previous demo data (idempotent re-runs, demo business only) ──
  await prisma.message.deleteMany({
    where: { conversation: { businessId: DEMO_BUSINESS_ID } },
  });
  await prisma.conversation.deleteMany({
    where: { businessId: DEMO_BUSINESS_ID },
  });
  await prisma.appointment.deleteMany({
    where: { businessId: DEMO_BUSINESS_ID },
  });
  await prisma.customer.deleteMany({
    where: { businessId: DEMO_BUSINESS_ID },
  });
  await prisma.service.deleteMany({
    where: { businessId: DEMO_BUSINESS_ID },
  });

  // ── Business: عيادة الابتسامة ──
  const faqs = [
    {
      question: "كم سعر كشف الأسنان؟",
      answer:
        "سعر الكشف 150 ريالاً ويتضمن فحصاً شاملاً للأسنان واللثة مع خطة علاج أولية.",
    },
    {
      question: "هل تقبلون التأمين الطبي؟",
      answer:
        "نعم، نتعامل مع أغلب شركات التأمين. أرسل صورة البطاقة قبل موعدك للتأكد من التغطية.",
    },
    {
      question: "كيف ألغي أو أعدّل موعدي؟",
      answer:
        "راسلنا عبر واتساب قبل 24 ساعة على الأقل من الموعد لإلغائه أو تعديله مجاناً.",
    },
  ];

  const business = await prisma.business.upsert({
    where: { id: DEMO_BUSINESS_ID },
    update: {
      faqs,
      slotDurationMinutes: 30,
      onboardingCompletedAt: new Date(),
      isActive: true,
    },
    create: {
      id: DEMO_BUSINESS_ID,
      name: "عيادة الابتسامة",
      city: "الرياض",
      whatsappNumber: "+966500000000",
      timezone: "Asia/Riyadh",
      about:
        "عيادة متخصصة في طب الأسنان التجميلي والعلاجي، نستقبل مواعيدكم عبر واتساب على مدار الأسبوع.",
      cancellationPolicy:
        "يُرجى إلغاء الموعد قبل 24 ساعة على الأقل، وإلا قد تُطبق رسوم إلغاء.",
      workingHours: {
        sun: { open: "09:00", close: "21:00", closed: false },
        mon: { open: "09:00", close: "21:00", closed: false },
        tue: { open: "09:00", close: "21:00", closed: false },
        wed: { open: "09:00", close: "21:00", closed: false },
        thu: { open: "09:00", close: "22:00", closed: false },
        fri: { open: "16:00", close: "22:00", closed: false },
        sat: { open: "09:00", close: "21:00", closed: true },
      },
      slotDurationMinutes: 30,
      faqs,
      onboardingCompletedAt: new Date(),
      isActive: true,
    },
  });
  console.log("✔ المنشأة:", business.name);

  // ── Staff: ADMIN + STAFF demo users (with login credentials) ──
  const adminEmail = "admin@flowpilot.app";
  const staffEmail = "staff@flowpilot.app";
  const DEMO_PASSWORDS = {
    admin: "Admin@1234",
    staff: "Staff@1234",
  } as const;

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", businessId: business.id, isActive: true },
    create: {
      id: DEMO_ADMIN_ID,
      name: "د. سارة العتيبي",
      email: adminEmail,
      emailVerified: true,
      image: null,
      role: "ADMIN",
      businessId: business.id,
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: staffEmail },
    update: { role: "STAFF", businessId: business.id, isActive: true },
    create: {
      id: DEMO_STAFF_ID,
      name: "نورة القحطاني",
      email: staffEmail,
      emailVerified: true,
      image: null,
      role: "STAFF",
      businessId: business.id,
      isActive: true,
    },
  });

  // Better Auth credential accounts — lets demo users sign in immediately.
  for (const [user, password] of [
    [admin, DEMO_PASSWORDS.admin],
    [staff, DEMO_PASSWORDS.staff],
  ] as const) {
    const existing = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });
    if (!existing) {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: await hashPassword(password),
        },
      });
    }
  }

  console.log("✔ الفريق:", admin.name, "و", staff.name);
  console.log("  دخول تجريبي:", `${adminEmail} / ${DEMO_PASSWORDS.admin}`);
  console.log(`  دخول تجريبي: ${staffEmail} / ${DEMO_PASSWORDS.staff}`);

  // ── Services ──
  const servicesData = [
    {
      key: "checkup",
      name: "كشف",
      description: "فحص شامل للأسنان واللثة وتقييم الحالة العامة.",
      durationMinutes: 30,
    },
    {
      key: "cleaning",
      name: "تنظيف أسنان",
      description: "إزالة الجير والتلميع مع نصائح للعناية اليومية.",
      durationMinutes: 45,
    },
    {
      key: "filling",
      name: "حشو",
      description: "علاج التسوس بحشوات تجميلية بلون الأسنان الطبيعي.",
      durationMinutes: 60,
    },
    {
      key: "consultation",
      name: "استشارة",
      description: "جلسة استشارية لمناقشة خطة العلاج والخيارات المتاحة.",
      durationMinutes: 20,
    },
  ] as const;

  const services: Record<(typeof servicesData)[number]["key"], string> =
    {} as never;

  for (const service of servicesData) {
    const created = await prisma.service.create({
      data: {
        businessId: business.id,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        isActive: true,
      },
    });
    services[service.key] = created.id;
  }
  console.log("✔ الخدمات:", servicesData.map((s) => s.name).join("، "));

  // ── Customers ──
  const customersData = [
    {
      key: "khaled",
      name: "خالد الشمري",
      phone: "+966551110001",
      notes: "يفضل المواعيد المسائية بعد العمل.",
    },
    {
      key: "amal",
      name: "أمل الدوسري",
      phone: "+966551110002",
      notes: "حساسية عالية من البرد — استخدم مطهرًا لطيفًا.",
    },
    {
      key: "faisal",
      name: "فيصل المطيري",
      phone: "+966551110003",
      notes: null,
    },
    {
      key: "reem",
      name: "ريم الحربي",
      phone: "+966551110004",
      notes: "متابعة تقويم كل شهرين.",
    },
    {
      key: "omar",
      name: "عمر الزهراني",
      phone: "+966551110005",
      notes: null,
    },
  ] as const;

  const customers: Record<(typeof customersData)[number]["key"], string> =
    {} as never;

  for (const customer of customersData) {
    const created = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes ?? undefined,
      },
    });
    customers[customer.key] = created.id;
  }
  console.log("✔ العملاء:", customersData.map((c) => c.name).join("، "));

  // ── Conversations + messages (real Arabic WhatsApp flow) ──
  type ConversationSeed = {
    customerId: string;
    status: "AI_ACTIVE" | "NEED_HUMAN" | "BOOKED" | "INCOMPLETE";
    aiSummary?: string;
    assignedUserId?: string;
    messages: Array<{
      senderType: "CUSTOMER" | "AI" | "STAFF";
      content: string;
      minutesAgo: number;
    }>;
  };

  const conversationsData: ConversationSeed[] = [
    {
      customerId: customers.khaled,
      status: "BOOKED",
      aiSummary: "عميل يطلب تنظيف أسنان، تم تأكيد الموعد مساء الخميس.",
      messages: [
        {
          senderType: "CUSTOMER",
          content: "السلام عليكم، أبي أحجز موعد لتنظيف الأسنان",
          minutesAgo: 240,
        },
        {
          senderType: "AI",
          content:
            "وعليكم السلام خالد 👋 أهلاً بك في عيادة الابتسامة! بالتأكيد، ما يناسبك أكثر: الصباح من 9 إلى 12 أم المساء من 6 إلى 9؟",
          minutesAgo: 238,
        },
        {
          senderType: "CUSTOMER",
          content: "المساء أفضل لي",
          minutesAgo: 236,
        },
        {
          senderType: "AI",
          content:
            "ممتاز! متاح بعد يومين الساعة 7:30 مساءً مع د. سارة. هل أكد لك الموعد؟",
          minutesAgo: 235,
        },
        {
          senderType: "CUSTOMER",
          content: "أكد، شكراً جزيلاً 🌹",
          minutesAgo: 233,
        },
        {
          senderType: "AI",
          content:
            "تم تأكيد حجزك ✅ يوم الخميس 7:30 مساءً — تنظيف أسنان. بانتظارك!",
          minutesAgo: 232,
        },
      ],
    },
    {
      customerId: customers.amal,
      status: "NEED_HUMAN",
      assignedUserId: staff.id,
      aiSummary: "عميلة تسأل عن ألم حاد في الضرس، تحتاج تدخلاً بشرياً عاجلاً.",
      messages: [
        {
          senderType: "CUSTOMER",
          content: "مرحباً، عندي ألم حاد في ضرس الفك اليسرى 😖",
          minutesAgo: 90,
        },
        {
          senderType: "AI",
          content:
            "نعتذر عن ما تشعرين به يا أمل. الألم الحاد يحتاج تقييماً من الطبيب مباشرة، سأحولك الآن لأحد فريقنا لمساعدتك بأسرع وقت.",
          minutesAgo: 89,
        },
        {
          senderType: "STAFF",
          content:
            "هلا أمل، أنا نورة من عيادة الابتسامة. عندنا فراغ اليوم الساعة 8 مساءً لكشف عاجل. يناسبك؟",
          minutesAgo: 45,
        },
      ],
    },
    {
      customerId: customers.faisal,
      status: "AI_ACTIVE",
      messages: [
        {
          senderType: "CUSTOMER",
          content: "كم سعر الحشو؟",
          minutesAgo: 20,
        },
        {
          senderType: "AI",
          content:
            "أهلاً فيصل! سعر الحشو التجميلي يبدأ من 250 ريال حسب حالة الضرس. تحب أحدد لك موعد كشف أولاً؟",
          minutesAgo: 19,
        },
      ],
    },
    {
      customerId: customers.reem,
      status: "INCOMPLETE",
      messages: [
        {
          senderType: "AI",
          content: "مساء الخير ريم 🌸 حان وقت موعد متابعة التقويم الشهري!",
          minutesAgo: 1440,
        },
        {
          senderType: "CUSTOMER",
          content: "سأرد عليكم لاحقاً لأحدد اليوم المناسب",
          minutesAgo: 1400,
        },
      ],
    },
    {
      customerId: customers.omar,
      status: "NEED_HUMAN",
      aiSummary:
        "عميل يطلب نقل موعده المؤكد اليوم إلى الغد — بانتظار تأكيد الفريق.",
      messages: [
        {
          senderType: "CUSTOMER",
          content:
            "السلام عليكم، طارئ شغل بسيط. ممكن أحول موعدي اليوم الساعة 5 إلى بكرة نفس الوقت؟",
          minutesAgo: 18,
        },
        {
          senderType: "AI",
          content:
            "وعليكم السلام عمر 👋 بالتأكيد نقدر نرتبها. سأحوّلك الآن لعضو الفريق لتثبيت الموعد الجديد.",
          minutesAgo: 17,
        },
      ],
    },
  ];

  for (const conversation of conversationsData) {
    const lastMessageAt = new Date(
      Date.now() -
        conversation.messages[conversation.messages.length - 1]!.minutesAgo *
          60_000,
    );

    const created = await prisma.conversation.create({
      data: {
        businessId: business.id,
        customerId: conversation.customerId,
        assignedUserId: conversation.assignedUserId ?? undefined,
        status: conversation.status,
        aiSummary: conversation.aiSummary ?? undefined,
        lastMessageAt,
      },
    });

    await prisma.message.createMany({
      data: conversation.messages.map((message) => ({
        conversationId: created.id,
        senderType: message.senderType,
        content: message.content,
        createdAt: new Date(Date.now() - message.minutesAgo * 60_000),
      })),
    });

    await prisma.customer.update({
      where: { id: conversation.customerId },
      data: { lastConversationAt: lastMessageAt },
    });
  }
  console.log(`✔ المحادثات: ${conversationsData.length} محادثات برسائلها`);

  // ── Appointments (mixed statuses) ──
  const appointmentsData: Array<{
    customerId: string;
    serviceKey: keyof typeof services;
    assignedUserId?: string;
    dayOffset: number;
    start: string;
    end: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
    notes?: string;
  }> = [
    // Today — a lively agenda right after login.
    {
      customerId: customers.reem,
      serviceKey: "cleaning",
      assignedUserId: staff.id,
      dayOffset: 0,
      start: "10:00",
      end: "10:45",
      status: "CONFIRMED",
      notes: "تنظيف دوري — أكدت الموعد عبر واتساب.",
    },
    {
      customerId: customers.omar,
      serviceKey: "checkup",
      assignedUserId: admin.id,
      dayOffset: 0,
      start: "17:00",
      end: "17:30",
      status: "CONFIRMED",
    },
    {
      customerId: customers.amal,
      serviceKey: "checkup",
      assignedUserId: staff.id,
      dayOffset: 0,
      start: "20:00",
      end: "20:30",
      status: "PENDING",
      notes: "كشف عاجل بسبب ألم في الضرس.",
    },
    // Upcoming.
    {
      customerId: customers.khaled,
      serviceKey: "cleaning",
      dayOffset: 2,
      start: "19:30",
      end: "20:15",
      status: "CONFIRMED",
      notes: "حجز مؤكد عبر واتساب.",
    },
    {
      customerId: customers.faisal,
      serviceKey: "filling",
      assignedUserId: admin.id,
      dayOffset: 4,
      start: "10:00",
      end: "11:00",
      status: "PENDING",
    },
    // History.
    {
      customerId: customers.reem,
      serviceKey: "consultation",
      dayOffset: -7,
      start: "17:00",
      end: "17:20",
      status: "COMPLETED",
      notes: "متابعة تقويم دورية.",
    },
    {
      customerId: customers.omar,
      serviceKey: "cleaning",
      dayOffset: -14,
      start: "11:00",
      end: "11:45",
      status: "NO_SHOW",
      notes: "لم يحضر ولم يجب على المكالمات.",
    },
    {
      customerId: customers.omar,
      serviceKey: "checkup",
      dayOffset: -3,
      start: "12:00",
      end: "12:30",
      status: "CANCELLED",
      notes: "ألغى الموعد بسبب ظرف طارئ.",
    },
  ];

  for (const appointment of appointmentsData) {
    await prisma.appointment.create({
      data: {
        businessId: business.id,
        customerId: appointment.customerId,
        serviceId: services[appointment.serviceKey],
        assignedUserId: appointment.assignedUserId ?? undefined,
        date: new Date(`${dateIn(appointment.dayOffset)}T00:00:00.000Z`),
        startTime: new Date(`1970-01-01T${appointment.start}:00.000Z`),
        endTime: new Date(`1970-01-01T${appointment.end}:00.000Z`),
        status: appointment.status,
        notes: appointment.notes ?? undefined,
      },
    });

    if (appointment.dayOffset < 0) {
      await prisma.customer.update({
        where: { id: appointment.customerId },
        data: {
          lastAppointmentAt: new Date(
            `${dateIn(appointment.dayOffset)}T00:00:00.000Z`,
          ),
        },
      });
    }
  }
  console.log(`✔ المواعيد: ${appointmentsData.length} بمختلف الحالات`);

  console.log("✅ تمت تعبئة البيانات التجريبية بنجاح.");
}

// Demo IDs — stable so re-running the seed is predictable.
const DEMO_BUSINESS_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const DEMO_ADMIN_ID = "9b2f1c3e-7a44-4c8e-9d21-6f5a8b0c2d10";
const DEMO_STAFF_ID = "4d8a2e61-93b7-4f0c-a5d3-1c7e9b2f8a40";

main()
  .catch((error) => {
    console.error("❌ فشلت عملية التعبئة:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
