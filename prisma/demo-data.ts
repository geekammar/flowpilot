/**
 * FlowPilot demo dataset — Egyptian dental-clinic demo business
 * (عيادة الابتسامة، كفر الشيخ).
 *
 * Pure data + deterministic helpers — no Prisma, no DB — so the dataset can
 * be validated standalone and consumed by prisma/seed.ts. The product itself
 * stays vertical-agnostic; only this dataset is dental (DECISIONS.md #14/#20).
 *
 * Everything is deterministic (stable IDs, generated phones, fixed offsets)
 * so re-running the seed produces the same demo state every time.
 */

import { createHash } from "node:crypto";

export const BUSINESS_TIMEZONE = "Africa/Cairo";

export const DEMO_IDS = {
  business: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  admin: "9b2f1c3e-7a44-4c8e-9d21-6f5a8b0c2d10",
  staff: "4d8a2e61-93b7-4f0c-a5d3-1c7e9b2f8a40",
} as const;

export const DEMO_CREDENTIALS = {
  admin: { email: "admin@flowpilot.app", password: "Admin@1234" },
  staff: { email: "staff@flowpilot.app", password: "Staff@1234" },
} as const;

/** Deterministic, UUID-shaped ID (stable across seed runs). */
export function stableId(namespace: string, key: string | number): string {
  const hex = createHash("sha1")
    .update(`flowpilot-demo:${namespace}:${key}`)
    .digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/** Deterministic Egyptian mobile number: +20 (10|11|12|15) + 8 digits. */
export function egyptianPhone(index: number): string {
  const prefixes = ["10", "11", "12", "15"];
  const prefix = prefixes[index % prefixes.length] ?? "10";
  // Spread digits deterministically; guaranteed unique for small indexes.
  const digits = String(24680135 + index * 7919)
    .padStart(8, "0")
    .slice(0, 8);
  return `+20${prefix}${digits}`;
}

/** "YYYY-MM-DD" for today ± offset days, in the business timezone. */
export function dateIn(now: Date, days: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = parts.split("-").map(Number);
  const target = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  target.setUTCDate(target.getUTCDate() + days);
  return target.toISOString().slice(0, 10);
}

// ─── Business ────────────────────────────────────────────────────────────────

export const demoBusiness = {
  name: "عيادة الابتسامة",
  city: "كفر الشيخ",
  whatsappNumber: "+201005551234",
  timezone: BUSINESS_TIMEZONE,
  about:
    "عيادة متخصصة في طب وتجميل الأسنان بكفر الشيخ. نستقبل مواعيدكم عبر واتساب طوال الأسبوع ونلتزم بالمعاد دقيقة بدقيقة.",
  cancellationPolicy:
    "يُرجى إبلاغنا قبل الموعد بـ ٢٤ ساعة على الأقل عند الاعتذار؛ عدم الحضور المتكرر بدون إبلاغ قد يترتب عليه أولوية أقل في الحجوزات المزدحمة.",
  slotDurationMinutes: 30,
  workingHours: {
    sun: { open: "10:00", close: "21:00", closed: false },
    mon: { open: "10:00", close: "21:00", closed: false },
    tue: { open: "10:00", close: "21:00", closed: false },
    wed: { open: "10:00", close: "21:00", closed: false },
    thu: { open: "10:00", close: "21:00", closed: false },
    fri: { open: "14:00", close: "21:00", closed: false },
    sat: { open: "10:00", close: "18:00", closed: false },
  },
  faqs: [
    {
      question: "كم سعر الكشف؟",
      answer:
        "الكشف والتشخيص ٣٠٠ جنيه، ولو بدأت العلاج في نفس الجلسة يتخصم سعر الكشف من التكلفة.",
    },
    {
      question: "هل تقبلون التأمين؟",
      answer:
        "أيوه، بنتعامل مع أغلب شركات التأمين. ابعت صورة الكارت هنا قبل المعاد بيوم على الأقل ونظبط الموافقة قبل زيارتك.",
    },
    {
      question: "هل عندكم علاج أسنان للأطفال؟",
      answer:
        "أيوه، عندنا أسلوب ومعدات مخصصة للأطفال من سنتين وأكثر، وأول زيارة غالبًا للتعوّد واللعب.",
    },
    {
      question: "فين العيادة بالظبط؟",
      answer:
        "كفر الشيخ — شارع البحر، عمارات المستشفى العام، الدور الثاني (قُبالة صيدلية العزبي)، وفيه موقف عربيات قدام العمارة.",
    },
    {
      question: "هل في تقسيط؟",
      answer:
        "أيوه، فيه تقسيط على العلاجات الكبيرة (التقويم والزيركون) حتى ٦ شهور — كلّم الإدارة للتفاصيل.",
    },
  ],
};

// ─── Team ────────────────────────────────────────────────────────────────────

export const demoTeam = [
  {
    key: "admin" as const,
    name: "د. سارة محمود الشريف",
    role: "ADMIN" as const,
    email: DEMO_CREDENTIALS.admin.email,
    password: DEMO_CREDENTIALS.admin.password,
    id: DEMO_IDS.admin,
  },
  {
    key: "staff" as const,
    name: "نورهان السيد",
    role: "STAFF" as const,
    email: DEMO_CREDENTIALS.staff.email,
    password: DEMO_CREDENTIALS.staff.password,
    id: DEMO_IDS.staff,
  },
];

// ─── Services ────────────────────────────────────────────────────────────────

export const demoServices = [
  {
    key: "checkup" as const,
    name: "كشف وتشخيص",
    description: "فحص شامل للأسنان واللثة مع خطة علاج واضحة.",
    durationMinutes: 30,
  },
  {
    key: "cleaning" as const,
    name: "تنظيف أسنان",
    description: "إزالة الجير والتلميع مع نصائح للعناية اليومية.",
    durationMinutes: 45,
  },
  {
    key: "filling" as const,
    name: "حشو تجميلي",
    description: "حشو ضوئي بلون الأسنان الطبيعي لعلاج التسوس.",
    durationMinutes: 60,
  },
  {
    key: "rootcanal" as const,
    name: "علاج عصب",
    description: "علاج جذور بجلسة واحدة في أغلب الحالات.",
    durationMinutes: 90,
  },
  {
    key: "whitening" as const,
    name: "تبييض بالليزر",
    description: "تبييض بالليزر بجلسة واحدة مع نتائج فورية.",
    durationMinutes: 60,
  },
  {
    key: "crown" as const,
    name: "تركيب تاج زيركون",
    description: "تاج زيركون بمقاسات رقمية دقيقة ولون طبيعي.",
    durationMinutes: 60,
  },
];

export type ServiceKey = (typeof demoServices)[number]["key"];

// ─── Customers (36) ──────────────────────────────────────────────────────────

const CUSTOMER_NAMES_AND_NOTES: ReadonlyArray<{
  name: string;
  notes: string | null;
}> = [
  {
    name: "أحمد محمود عبد العزيز",
    notes: "يفضّل المواعيد المسائية بعد الدوام.",
  },
  { name: "فاطمة السيد متولي", notes: "متابعة تنظيف كل ٦ شهور." },
  { name: "محمد إبراهيم حسن", notes: null },
  {
    name: "نورهان خالد فؤاد",
    notes: "قلقة من علاج الأسنان — تحتاج طمأنة قبل الجلسة.",
  },
  { name: "عمر أشرف الشافعي", notes: null },
  { name: "مريم عادل رشاد", notes: "أم لطفلين — تحجز لأسرتها دائمًا." },
  {
    name: "كريم سامي عبد الله",
    notes: "أول زيارة — يطلب العنوان دائمًا قبل الموعد.",
  },
  { name: "سلمى طارق منصور", notes: null },
  { name: "يوسف هشام الزهيري", notes: "مهتم بالتقسيط للعلاجات الكبيرة." },
  {
    name: "هبة الله محسن عمران",
    notes: "فرح أختها الشهر القادم — تريد تبييضًا قبله.",
  },
  {
    name: "مصطفى كمال الجندي",
    notes: "تأمين شركة — يرسل صورة الكارت قبل كل زيارة.",
  },
  { name: "دعاء صابر عوض", notes: null },
  {
    name: "إسلام رمضان عبد المقصود",
    notes: "حجز سابقًا واشتكى من الانتظار — تم تعويضه.",
  },
  { name: "أسماء جمال بدوي", notes: null },
  { name: "طه علاء الديب", notes: null },
  { name: "منى رأفت الهواري", notes: "تاج زيركون جاهز من المعمل." },
  { name: "شريف نبيل عكاشة", notes: "حساسية مؤقتة بعد التنظيف — تُتابع." },
  {
    name: "رنا ماهر شلبي",
    notes: "حامل (الشهر الرابع) — أي علاج بعد تقييم الطبيبة.",
  },
  { name: "حسام الدين فتحي", notes: "يتزوج قريبًا — مهتم بالتبييض." },
  {
    name: "إيمان محمد أبو الخير",
    notes: "ابنتها (٥ سنين) تخاف من دكتور الأسنان.",
  },
  { name: "عمرو وليد قنديل", notes: null },
  { name: "سارة حسام أبو زيد", notes: null },
  { name: "محمود عصام الصعيدي", notes: null },
  { name: "ندى شريف البرعي", notes: null },
  { name: "أيمن رجب غريب", notes: null },
  { name: "يارا مجدي الشناوي", notes: "تحوّلت من توصية صديقة." },
  { name: "خالد صلاح مرسي", notes: null },
  { name: "آمنة حاتم عبد اللطيف", notes: "مريضة سكري — تنبيه قبل أي علاج." },
  { name: "زياد أيمن عبد الحميد", notes: null },
  { name: "شيماء ناصر فرغلي", notes: null },
  { name: "عبد الرحمن شوقي سلامة", notes: null },
  { name: "مالك أشرف ثابت", notes: null },
  { name: "جنى عماد الليثي", notes: "طالبة — مواعيد نهاية الأسبوع فقط." },
  { name: "فادي ممدوح البنا", notes: null },
  { name: "رقية عصام زيدان", notes: null },
  { name: "هاني سيد العتربي", notes: null },
];

export const demoCustomers = CUSTOMER_NAMES_AND_NOTES.map(
  (customer, index) => ({
    id: stableId("customer", index),
    name: customer.name,
    phone: egyptianPhone(index),
    notes: customer.notes,
  }),
);

// ─── Conversations (22) ──────────────────────────────────────────────────────

export type ConversationSeed = {
  id: string;
  customerIndex: number;
  status: "AI_ACTIVE" | "NEED_HUMAN" | "BOOKED" | "INCOMPLETE";
  aiSummary?: string;
  assignee: "admin" | "staff" | null;
  messages: Array<{
    senderType: "CUSTOMER" | "AI" | "STAFF";
    content: string;
    minutesAgo: number;
  }>;
};

export const demoConversations: ConversationSeed[] = [
  {
    id: stableId("conversation", 1),
    customerIndex: 0,
    status: "BOOKED",
    aiSummary: "طلب حجز تنظيف أسنان — تم التأكيد مساء الغد ٧:٣٠.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "السلام عليكم، عايز أحجز معاد تنظيف أسنان لو سمحت",
        minutesAgo: 1500,
      },
      {
        senderType: "AI",
        content:
          "وعليكم السلام أهلاً بيك يا أحمد في عيادة الابتسامة 😊 طبعًا! تناسبك الصبح من ١٠ لـ ١ ولا بالليل من ٦ لـ ٩؟",
        minutesAgo: 1498,
      },
      {
        senderType: "CUSTOMER",
        content: "الليل أحسن لي بعد الدوام",
        minutesAgo: 1495,
      },
      {
        senderType: "AI",
        content: "تمام! متاح بكرة الساعة ٧:٣٠ مساءً مع د. سارة. أأكد لك؟",
        minutesAgo: 1493,
      },
      {
        senderType: "CUSTOMER",
        content: "أكد يا دكتور، شكرًا 🌹",
        minutesAgo: 1491,
      },
      {
        senderType: "AI",
        content:
          "اتأكد حجزك ✅ بكرة ٧:٣٠ م — تنظيف أسنان. لو حصل أي ظرف ابعتلنا قبلها بساعة على الأقل. في انتظارك!",
        minutesAgo: 1490,
      },
    ],
  },
  {
    id: stableId("conversation", 2),
    customerIndex: 3,
    status: "NEED_HUMAN",
    aiSummary:
      "طلبت تأجيل موعد الغد ٥ م إلى فترة صباحية — بانتظار تثبيت الفريق.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content:
          "معذرةً أنا مش هقدر أحضر معادي بكرة الساعة ٥، ممكن نأجله آخر الأسبوع؟",
        minutesAgo: 18,
      },
      {
        senderType: "AI",
        content:
          "ولا يهمك يا نورهان 👍 هشوف لك أقرب ميعاد صباحي متاح وأرد عليك في دقايق.",
        minutesAgo: 17,
      },
      {
        senderType: "AI",
        content:
          "للتأكيد: عايزة تنقلي موعدك (كشف) من بكرة ٥ م لأي يوم صباحي آخر الأسبوع — صح؟",
        minutesAgo: 16,
      },
      {
        senderType: "CUSTOMER",
        content: "أيوه بالظبط، وأكون ممتنة لو يكون الصبح بدري شوية",
        minutesAgo: 15,
      },
      {
        senderType: "AI",
        content: "تمام، هحوّل المحادثة لفريق العيادة لتثبيت الميعاد الجديد ✋",
        minutesAgo: 14,
      },
    ],
  },
  {
    id: stableId("conversation", 3),
    customerIndex: 4,
    status: "NEED_HUMAN",
    aiSummary: "ألم حاد في الضرس — حجز كشف عاجل ٨ م وأكده فريق الاستقبال.",
    assignee: "staff",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "أنا وجع ضروسي رهيب من امبارح ومش قادر أنام 😖",
        minutesAgo: 140,
      },
      {
        senderType: "AI",
        content:
          "ربنا يشفيك يا عمر 🤍 الألم الحاد محتاج كشف عاجل. عندنا فتحة النهاردة ٨ م أو بكرة ١١ ص — أنسب لك أنهي واحدة؟",
        minutesAgo: 139,
      },
      {
        senderType: "CUSTOMER",
        content: "النهاردة لو ينفع",
        minutesAgo: 137,
      },
      {
        senderType: "AI",
        content:
          "حجزت لك مبدئيًا النهاردة ٨ م (كشف عاجل) ✅ وهحوّلك لأحد أعضاء الفريق للتأكيد.",
        minutesAgo: 136,
      },
      {
        senderType: "STAFF",
        content:
          "مساء الخير عمر، أنا نورهان من عيادة الابتسامة. أكدنا معادك النهاردة ٨ م كشف عاجل. لو الألم زاد قبلها ابعتلنا فورًا.",
        minutesAgo: 45,
      },
    ],
  },
  {
    id: stableId("conversation", 4),
    customerIndex: 1,
    status: "AI_ACTIVE",
    aiSummary: "سألت عن سعر التبييض (٢٥٠٠ ج) — ستفكر وترد.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "مساء الخير، بسال كم سعر تبييض الأسنان عندكم؟",
        minutesAgo: 95,
      },
      {
        senderType: "AI",
        content:
          "مساء النور يا فاطمة 🌸 تبييض الليزر بـ ٢٥٠٠ جنيه للجلسة الكاملة، والنتيجة بتظهر من أول جلسة. تحبي أحجزلك كشف سريع الأول؟",
        minutesAgo: 93,
      },
      {
        senderType: "CUSTOMER",
        content: "مش دلوقتي، هفكر وأرد عليكم",
        minutesAgo: 92,
      },
      {
        senderType: "AI",
        content: "خذي راحتك تمام 👌 وأي وقت تبعتلي هنا أرد عليك في دقايق.",
        minutesAgo: 91,
      },
    ],
  },
  {
    id: stableId("conversation", 5),
    customerIndex: 2,
    status: "INCOMPLETE",
    aiSummary: "سأل عن مواعيد الصباح ولم يكمل الحجز.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "إزيكم، فيه معاد صبح بكرة لكشف؟",
        minutesAgo: 1600,
      },
      {
        senderType: "AI",
        content:
          "أهلاً محمد 👋 أيوه متاح بكرة ١٠:٠٠ ص أو ١١:٣٠ ص. أنهي واحد يناسبك؟",
        minutesAgo: 1598,
      },
    ],
  },
  {
    id: stableId("conversation", 6),
    customerIndex: 5,
    status: "BOOKED",
    aiSummary: "حجز كشف أسنان أطفال لابنها يوسف (٨ سنين) — مؤكد الغد ٤:٣٠ م.",
    assignee: "admin",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "سلام عليكم، عايزة أحجز ليوسف ابني ٨ سنين كشف، بيشتكي من ضرسه",
        minutesAgo: 2900,
      },
      {
        senderType: "AI",
        content:
          "وعليكم السلام يا مريم 🤍 عندنا أسلوب مخصوص للأطفال يخلي الزيارة سهلة عليه. يناسب يوسف بكرة ٤:٣٠ م؟",
        minutesAgo: 2898,
      },
      {
        senderType: "CUSTOMER",
        content: "تمام الساعة دي كويسة",
        minutesAgo: 2895,
      },
      {
        senderType: "AI",
        content:
          "اتأكد الحجز ✅ بكرة ٤:٣٠ م — كشف أسنان أطفال ليوسف. جهّزيه إن الدكتورة هتكلمه عن أسنانه الحلوة 😄 ننتظركم!",
        minutesAgo: 2893,
      },
    ],
  },
  {
    id: stableId("conversation", 7),
    customerIndex: 6,
    status: "AI_ACTIVE",
    aiSummary: "سأل عن العنوان — تم إرشاده بالتفصيل.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "ممكن العنوان بالتفصيل؟ أول مرة أجيلكم",
        minutesAgo: 55,
      },
      {
        senderType: "AI",
        content:
          "أهلاً كريم 👋 احنا في شارع البحر، عمارات المستشفى العام، الدور التاني، شقة ٤ — قُبالة صيدلية العزبي. فيه موقف عربيات في الجنينة اللي قدام العمارة.",
        minutesAgo: 54,
      },
      {
        senderType: "CUSTOMER",
        content: "تمام، شكرًا 🙏",
        minutesAgo: 53,
      },
    ],
  },
  {
    id: stableId("conversation", 8),
    customerIndex: 7,
    status: "BOOKED",
    aiSummary: "حجز علاج عصب (٩٠ دقيقة) — مؤكد ٦:٠٠ م.",
    assignee: "admin",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "الدكتور قال محتاجة علاج عصب للضرس اللي في الآخر. أحجز امتى؟",
        minutesAgo: 3900,
      },
      {
        senderType: "AI",
        content:
          "أهلاً سلمى، متضايقة إنك محتاجة علاج بس مطمنينك إنه روتيني عندنا 😊 علاج العصب بجلسة واحدة غالبًا (٩٠ دقيقة). يناسبك بعد ٣ أيام الساعة ٦:٠٠ م؟",
        minutesAgo: 3898,
      },
      {
        senderType: "CUSTOMER",
        content: "٦ المسا تمام",
        minutesAgo: 3895,
      },
      {
        senderType: "AI",
        content:
          "اتأكد الحجز ✅ بعد ٣ أيام ٦:٠٠ م — علاج عصب مع د. سارة. لو محتاجة أي حاجة قبلها ابعتيلنا.",
        minutesAgo: 3893,
      },
    ],
  },
  {
    id: stableId("conversation", 9),
    customerIndex: 8,
    status: "NEED_HUMAN",
    aiSummary: "يسأل عن تقسيط العلاجات الكبيرة — محوّل للإدارة (سياسة مالية).",
    assignee: "admin",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "سلام عليكم، التقويم أو الزيركون عندكم فيه تقسيط؟",
        minutesAgo: 4100,
      },
      {
        senderType: "AI",
        content:
          "وعليكم السلام يوسف 👋 للخيارات المتاحة بالتقسيط هخليك تتكلم مع الإدارة مباشرة عشان تظبطلك أنسب نظام. لحظة واحدة…",
        minutesAgo: 4099,
      },
    ],
  },
  {
    id: stableId("conversation", 10),
    customerIndex: 9,
    status: "INCOMPLETE",
    aiSummary: "تريد تبييضًا قبل مناسبة عائلية — لم تكمل الحجز.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "مساء الخير، عايزة أحجز تبييض قبل فرح أختي 🤍",
        minutesAgo: 5200,
      },
      {
        senderType: "AI",
        content:
          "مبروك مقدماً يا هبة 🎉 التبييض محتاج كشف سريع قبله عشان نتأكد إن الأسنان جاهزة. يناسبك كشف الأربعاء الجاي ٧ م؟",
        minutesAgo: 5198,
      },
    ],
  },
  {
    id: stableId("conversation", 11),
    customerIndex: 10,
    status: "AI_ACTIVE",
    aiSummary: "سؤال عن التأمين — سيرسل صورة الكارت قبل المعاد.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "هل بتتعاملوا مع التأمين؟ معايا تأمين شركة",
        minutesAgo: 6200,
      },
      {
        senderType: "AI",
        content:
          "أيوه يا مصطفى 👋 بنتعامل مع أغلب شركات التأمين. ابعت صورة الكارت هنا قبل المعاد بيوم على الأقل ونظبط الموافقة قبل ما تيجي. تحبي أحجزلك كشف؟",
        minutesAgo: 6199,
      },
      {
        senderType: "CUSTOMER",
        content: "هبعت الكارت بكرة إن شاء الله",
        minutesAgo: 6195,
      },
    ],
  },
  {
    id: stableId("conversation", 12),
    customerIndex: 11,
    status: "BOOKED",
    aiSummary: "تنظيف دوري كل ٦ شهور — مؤكد ١١:٠٠ ص.",
    assignee: "staff",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "أنا خلصت التنظيف من ٦ شهور، عايزة أعيد زي ما الدكتورة قالتلي",
        minutesAgo: 200,
      },
      {
        senderType: "AI",
        content:
          "أهلاً بيكِ تاني 🤍 المتابعة كل ٦ شهور أحسن حاجة للأسنان. يناسبك بعد أسبوعين الأحد ١١ ص؟",
        minutesAgo: 199,
      },
      {
        senderType: "CUSTOMER",
        content: "كويس، حدديهولي",
        minutesAgo: 197,
      },
      {
        senderType: "AI",
        content: "اتأكد ✅ الأحد ١١:٠٠ ص — تنظيف أسنان. نشوفك على خير!",
        minutesAgo: 196,
      },
    ],
  },
  {
    id: stableId("conversation", 13),
    customerIndex: 12,
    status: "NEED_HUMAN",
    aiSummary: "شكوى تأخير في الانتظار — عالجها الفريق باعتذار وخصم ١٠٠ ج.",
    assignee: "staff",
    messages: [
      {
        senderType: "CUSTOMER",
        content:
          "أنا كنت محجوز امبارح واتأخرت عليا ساعة ونص في الانتظار، ده مش مقبول",
        minutesAgo: 300,
      },
      {
        senderType: "AI",
        content:
          "نعتذر بصدق يا إسلام على التأخير 😔 المواعيد الطارئة أحيانًا تطوّل الجلسة اللي قبلها. هحوّلك لمسؤولة الاستقبال شخصيًا للرد على ملاحظتك.",
        minutesAgo: 299,
      },
      {
        senderType: "STAFF",
        content:
          "أستاذ إسلام، نورهان من العيادة. نعتذر مرة تانية للتأخير — رصدنا السبب وضبطنا جدول الدكتورة النهاردة. ولمعادك الجاي خصم ١٠٠ جنيه من كشف المتابعة.",
        minutesAgo: 240,
      },
      {
        senderType: "CUSTOMER",
        content: "شكرًا على الرد، مقدّر ده",
        minutesAgo: 235,
      },
    ],
  },
  {
    id: stableId("conversation", 14),
    customerIndex: 13,
    status: "AI_ACTIVE",
    aiSummary: "سؤال عن ساعات العمل يوم الجمعة.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "بتفتحوا إمتى يوم الجمعة؟",
        minutesAgo: 75,
      },
      {
        senderType: "AI",
        content:
          "يوم الجمعة شغالين من ٤ العصر لـ ٩ بالليل 🌙 وباقي الأيام من ١٠ الصبح. يناسبك تحجزي؟",
        minutesAgo: 74,
      },
    ],
  },
  {
    id: stableId("conversation", 15),
    customerIndex: 14,
    status: "INCOMPLETE",
    aiSummary: "طلب قائمة الأسعار — لم يكمل.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "عايز أعرف أسعاركم كلها لو سمحت",
        minutesAgo: 7300,
      },
      {
        senderType: "AI",
        content:
          "أهلاً طه 👋 الكشف ٣٠٠ ج، التنظيف ٦٠٠ ج، الحشو التجميلي من ٨٠٠ ج حسب الضرس، وعلاج العصب من ١٥٠٠ ج. عايز تفاصيل عن خدمة معينة؟",
        minutesAgo: 7299,
      },
    ],
  },
  {
    id: stableId("conversation", 16),
    customerIndex: 15,
    status: "BOOKED",
    aiSummary: "تركيب تاج الزيركون — مؤكد ٥:٠٠ م.",
    assignee: "admin",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "الدكتورة قالت لي التاج جه من المعمل. أحجز امتى للتركيب؟",
        minutesAgo: 5600,
      },
      {
        senderType: "AI",
        content:
          "أهلاً منى 💫 برافو، وصلنا لآخر خطوة! التركيب بياخد ٦٠ دقيقة. يناسبك بعد يومين الساعة ٥:٠٠ م؟",
        minutesAgo: 5599,
      },
      {
        senderType: "CUSTOMER",
        content: "يومين كويس",
        minutesAgo: 5597,
      },
      {
        senderType: "AI",
        content:
          "اتأكد ✅ بعد يومين ٥:٠٠ م — تركيب تاج زيركون. لو حاسة بأي وجع قبلها ابعتيلنا.",
        minutesAgo: 5596,
      },
    ],
  },
  {
    id: stableId("conversation", 17),
    customerIndex: 16,
    status: "AI_ACTIVE",
    aiSummary: "متابعة حساسية بعد تنظيف — إجابة اطمئنان وحدود متابعة.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "خلصت تنظيف امبارح، حساسيتي من البارد زادت شوية، ده طبيعي؟",
        minutesAgo: 380,
      },
      {
        senderType: "AI",
        content:
          "طبيعي تمام يا شريف 👌 الحساسية بعد التنظيف بتروح في يومين لثلاثة. استخدم معجون للأسنان الحساسة وبلاش المشروبات ساقعة جدًا اليومين دول. لو استمرت بعد ٣ أيام أو زادت قوليلي نظبطلك كشف.",
        minutesAgo: 379,
      },
      {
        senderType: "CUSTOMER",
        content: "تمام، مطمن دلوقتي. شكرًا 🙏",
        minutesAgo: 377,
      },
    ],
  },
  {
    id: stableId("conversation", 18),
    customerIndex: 17,
    status: "NEED_HUMAN",
    aiSummary:
      "حامل في الشهر الرابع بسن مكسور — تحتاج تقييم الطبيبة قبل أي علاج.",
    assignee: "admin",
    messages: [
      {
        senderType: "CUSTOMER",
        content:
          "أنا في الشهر الرابع من الحمل وفي سن مكسور بيوجعني، أقدر أعمل حشو دلوقتي؟",
        minutesAgo: 440,
      },
      {
        senderType: "AI",
        content:
          "مبروك يا رنا 🤍 وبالنسبة للسن: الحشو في الشهر الرابع غالبًا آمن، بس الدكتورة لازم تشوف حالتك بنفسها الأول. هحوّلك للفريق يحددولك معاد تقييم.",
        minutesAgo: 439,
      },
    ],
  },
  {
    id: stableId("conversation", 19),
    customerIndex: 18,
    status: "BOOKED",
    aiSummary: "يريد تبييضًا قبل زواجه — كشف أولي مؤكد ١٢:٠٠ م.",
    assignee: "admin",
    messages: [
      {
        senderType: "CUSTOMER",
        content: "حبيت أعمل تبييض قبل جوازتي 😅 أحجز معاد",
        minutesAgo: 5000,
      },
      {
        senderType: "AI",
        content:
          "مبروك مقدماً يا حسام 🎉 التبييض بيبدأ بكشف سريع (٣٠ دقيقة) وبعده الجلسة في نفس الأسبوع. يناسبك كشف السبت ١٢ م؟",
        minutesAgo: 4999,
      },
      {
        senderType: "CUSTOMER",
        content: "سبت ١٢ تمام يا دكتور",
        minutesAgo: 4997,
      },
      {
        senderType: "AI",
        content: "اتأكد ✅ السبت ١٢:٠٠ م — كشف قبل تبييض. ألف مبروك مقدماً 🌹",
        minutesAgo: 4996,
      },
    ],
  },
  {
    id: stableId("conversation", 20),
    customerIndex: 19,
    status: "AI_ACTIVE",
    aiSummary: "طفلة تخاف من طبيب الأسنان — عُرض أسلوب التهيئة للأطفال.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "بنتي ٥ سنين خايفة من الدكتور، بتعملوا حاجة للخايفين؟ 😅",
        minutesAgo: 150,
      },
      {
        senderType: "AI",
        content:
          "أكيد يا إيمان 🤍 أول زيارة عندنا للّعب: البنت تشوف الأدوات وتلمس المرآة ونحكيلها قصة قبل أي فحص — أغلب الأطفال بيضحكوا آخر الزيارة 😄 تحبي تجرب؟",
        minutesAgo: 149,
      },
      {
        senderType: "CUSTOMER",
        content: "فكرة حلوة، هكلمها وأردلكم",
        minutesAgo: 147,
      },
    ],
  },
  {
    id: stableId("conversation", 21),
    customerIndex: 20,
    status: "INCOMPLETE",
    aiSummary: "لم يحدد يوم الحجز ولم يكمل.",
    assignee: null,
    messages: [
      {
        senderType: "CUSTOMER",
        content: "عايز أحجز حشو، بس مش متأكد يومي",
        minutesAgo: 8600,
      },
      {
        senderType: "AI",
        content:
          "سلمها لينا 👋 قولي يومين يناسبوك وأنا أحجزلك أقربهم، وأقدر أعدّل بعدين لو تغير ظرفك.",
        minutesAgo: 8599,
      },
    ],
  },
  {
    id: stableId("conversation", 22),
    customerIndex: 21,
    status: "AI_ACTIVE",
    aiSummary: "تذكير بموعد الغد ٦:٣٠ م — العميل أكدت الحضور.",
    assignee: null,
    messages: [
      {
        senderType: "AI",
        content:
          "مساء الخير يا سارة 🌸 بتذكير ودّي: معادك بكرة ٦:٣٠ م (كشف ومتابعة). لو عايزة تعديل ابعتيلي هنا.",
        minutesAgo: 60,
      },
      {
        senderType: "CUSTOMER",
        content: "شكرًا للتذكير، مؤكد إن شاء الله ✅",
        minutesAgo: 58,
      },
      {
        senderType: "AI",
        content: "جميل! نشوفك بكرة على خير 🤍",
        minutesAgo: 57,
      },
    ],
  },
];

// ─── Appointments (36) ───────────────────────────────────────────────────────

export type AppointmentSeed = {
  customerIndex: number;
  serviceKey: ServiceKey;
  assignee: "admin" | "staff" | null;
  dayOffset: number;
  start: string;
  end: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
};

export const demoAppointments: AppointmentSeed[] = [
  // Past — completed history with a couple of cancellations and a no-show.
  {
    customerIndex: 23,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -12,
    start: "11:00",
    end: "11:30",
    status: "COMPLETED",
  },
  {
    customerIndex: 24,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: -12,
    start: "18:00",
    end: "18:45",
    status: "COMPLETED",
  },
  {
    customerIndex: 25,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: -11,
    start: "16:00",
    end: "17:00",
    status: "COMPLETED",
  },
  {
    customerIndex: 26,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -10,
    start: "10:30",
    end: "11:00",
    status: "COMPLETED",
  },
  {
    customerIndex: 27,
    serviceKey: "rootcanal",
    assignee: "admin",
    dayOffset: -10,
    start: "19:00",
    end: "20:30",
    status: "COMPLETED",
    notes: "جلسة أولى.",
  },
  {
    customerIndex: 28,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -9,
    start: "12:00",
    end: "12:30",
    status: "COMPLETED",
  },
  {
    customerIndex: 29,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: -8,
    start: "17:00",
    end: "17:45",
    status: "COMPLETED",
  },
  {
    customerIndex: 30,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -8,
    start: "19:00",
    end: "19:30",
    status: "CANCELLED",
    notes: "ألغى لظرف عائلي.",
  },
  {
    customerIndex: 31,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: -7,
    start: "11:30",
    end: "12:30",
    status: "COMPLETED",
  },
  {
    customerIndex: 32,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: -6,
    start: "18:30",
    end: "19:15",
    status: "COMPLETED",
  },
  {
    customerIndex: 33,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -6,
    start: "15:00",
    end: "15:30",
    status: "COMPLETED",
  },
  {
    customerIndex: 34,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: -5,
    start: "16:30",
    end: "17:30",
    status: "COMPLETED",
  },
  {
    customerIndex: 35,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: -5,
    start: "11:00",
    end: "11:45",
    status: "NO_SHOW",
    notes: "لم يحضر ولم يُجب على رسالة التذكير.",
  },
  {
    customerIndex: 1,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -4,
    start: "18:00",
    end: "18:30",
    status: "COMPLETED",
    notes: "استشارة تبييض — قررت التأجيل.",
  },
  {
    customerIndex: 4,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -3,
    start: "12:30",
    end: "13:00",
    status: "CANCELLED",
    notes: "ألغى لظرف عمل — سيحجز لاحقًا.",
  },
  {
    customerIndex: 23,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: -2,
    start: "17:00",
    end: "18:00",
    status: "COMPLETED",
  },
  {
    customerIndex: 9,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: -2,
    start: "19:30",
    end: "20:00",
    status: "COMPLETED",
  },
  // Today — a lively agenda right after login.
  {
    customerIndex: 1,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: 0,
    start: "10:00",
    end: "10:45",
    status: "CONFIRMED",
    notes: "تنظيف دوري — أكدت الموعد عبر واتساب.",
  },
  {
    customerIndex: 26,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 0,
    start: "11:30",
    end: "12:00",
    status: "CONFIRMED",
  },
  {
    customerIndex: 14,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 0,
    start: "17:30",
    end: "18:00",
    status: "CONFIRMED",
  },
  {
    customerIndex: 4,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 0,
    start: "20:00",
    end: "20:30",
    status: "PENDING",
    notes: "كشف عاجل بسبب ألم حاد في الضرس.",
  },
  // Upcoming — mirrors the BOOKED conversations plus organic backlog.
  {
    customerIndex: 3,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 1,
    start: "17:00",
    end: "17:30",
    status: "PENDING",
    notes: "طلبت العميلة تأجيله لفترة صباحية — قيد الترتيب.",
  },
  {
    customerIndex: 5,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 1,
    start: "16:30",
    end: "17:00",
    status: "CONFIRMED",
    notes: "كشف أسنان أطفال — يوسف (٨ سنين).",
  },
  {
    customerIndex: 21,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 1,
    start: "18:30",
    end: "19:00",
    status: "CONFIRMED",
  },
  {
    customerIndex: 0,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: 1,
    start: "19:30",
    end: "20:15",
    status: "CONFIRMED",
    notes: "حجز مؤكد عبر واتساب.",
  },
  {
    customerIndex: 15,
    serviceKey: "crown",
    assignee: "admin",
    dayOffset: 2,
    start: "17:00",
    end: "18:00",
    status: "CONFIRMED",
    notes: "التركيب النهائي للتاج.",
  },
  {
    customerIndex: 25,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: 2,
    start: "11:00",
    end: "12:00",
    status: "PENDING",
  },
  {
    customerIndex: 7,
    serviceKey: "rootcanal",
    assignee: "admin",
    dayOffset: 3,
    start: "18:00",
    end: "19:30",
    status: "CONFIRMED",
    notes: "علاج عصب بجلسة واحدة.",
  },
  {
    customerIndex: 27,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 3,
    start: "10:30",
    end: "11:00",
    status: "PENDING",
  },
  {
    customerIndex: 18,
    serviceKey: "checkup",
    assignee: "admin",
    dayOffset: 4,
    start: "12:00",
    end: "12:30",
    status: "CONFIRMED",
    notes: "كشف أولي قبل التبييض.",
  },
  {
    customerIndex: 25,
    serviceKey: "whitening",
    assignee: "admin",
    dayOffset: 4,
    start: "18:00",
    end: "19:00",
    status: "CONFIRMED",
    notes: "تبييض بالليزر — جاءت بتوصية صديقة.",
  },
  {
    customerIndex: 30,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: 4,
    start: "16:00",
    end: "16:45",
    status: "PENDING",
  },
  {
    customerIndex: 11,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: 5,
    start: "11:00",
    end: "11:45",
    status: "CONFIRMED",
    notes: "تنظيف دوري كل ٦ شهور.",
  },
  {
    customerIndex: 33,
    serviceKey: "cleaning",
    assignee: "staff",
    dayOffset: 5,
    start: "19:00",
    end: "19:45",
    status: "PENDING",
  },
  {
    customerIndex: 34,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: 6,
    start: "10:00",
    end: "11:00",
    status: "PENDING",
  },
  {
    customerIndex: 22,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: 6,
    start: "15:00",
    end: "15:30",
    status: "PENDING",
  },
  {
    customerIndex: 28,
    serviceKey: "filling",
    assignee: "admin",
    dayOffset: 6,
    start: "18:00",
    end: "19:00",
    status: "PENDING",
  },
];
