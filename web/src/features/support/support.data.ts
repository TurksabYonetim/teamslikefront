// web/src/features/support/support.data.ts
import type {
  AdherenceRow,
  Agent,
  BotFlow,
  CannedResponse,
  Contact,
  Conversation,
  Inbox,
  KbArticle,
  Macro,
  QaEvaluation,
  ScorecardCriterion,
  Shift,
  StaffingInterval,
  StudioAgent,
} from "./support.types";

const MIN = 60_000;
const base = Date.now();

/** Mock "current agent" kimliği (auth store yok; frontend-only). */
export const ME_ID = "usr_1";

/** Etiket havuzu (ContactPanel etiket seçici için). */
export const LABELS = ["billing", "bug-report", "refund", "sales", "vip"];

export const INBOXES: Inbox[] = [
  { id: "ib_chat", channelType: "livechat", name: "Website sohbet", connection: "connected", provider: "native" },
  { id: "ib_wa", channelType: "whatsapp", name: "WhatsApp", connection: "coexistence", provider: "cloud_api" },
  { id: "ib_mail", channelType: "email", name: "Destek e-posta", connection: "connected", provider: "native" },
  { id: "ib_tg", channelType: "telegram", name: "Telegram bot", connection: "pending", provider: "native" },
  { id: "ib_ig", channelType: "instagram", name: "Instagram DM", connection: "disconnected", provider: "bsp" },
];

export const AGENTS: Agent[] = [
  { id: "usr_1", name: "Sen", available: true, skills: ["billing", "tier2"] },
  { id: "usr_3", name: "Sora Kim", available: true, skills: ["tier1"] },
  { id: "usr_4", name: "Devin Roy", available: false, skills: ["billing"] },
];

export const CONTACTS: Contact[] = [
  { id: "ct_jordan", name: "Jordan Blake", identifiers: { email: "jordan@acme.com", phone: "+16285550199" }, attributes: { plan: "Pro", company: "Acme" } },
  { id: "ct_dana", name: "Dana Wu", identifiers: { email: "dana@globex.io", social: "@danawu" }, attributes: { plan: "Enterprise", company: "Globex" } },
  { id: "ct_leo", name: "Leo Pratt", identifiers: { phone: "+12025550188" }, attributes: { plan: "Free" } },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv1", inboxId: "ib_chat", contactId: "ct_jordan", assigneeId: "usr_1",
    status: "open", priority: "high", slaDueAt: base + 8 * MIN, labels: ["billing"], unread: 1,
    messages: [
      { id: "m1", conversationId: "cv1", direction: "in", authorType: "contact", authorId: "ct_jordan", body: "Bu ayki faturam yanlış görünüyor.", tMinutes: 6 },
      { id: "m2", conversationId: "cv1", direction: "out", authorType: "agent", authorId: "usr_1", body: "Hemen kontrol ediyorum.", tMinutes: 4 },
    ],
  },
  {
    id: "cv2", inboxId: "ib_wa", contactId: "ct_dana",
    status: "pending", priority: "urgent", slaDueAt: base - 3 * MIN, labels: ["bug-report"], unread: 2,
    messages: [
      { id: "m3", conversationId: "cv2", direction: "in", authorType: "contact", authorId: "ct_dana", body: "Dışa aktar butonu 500 hatası veriyor.", tMinutes: 20 },
      { id: "m4", conversationId: "cv2", direction: "in", authorType: "contact", authorId: "ct_dana", body: "Hâlâ bozuk — bu acil.", tMinutes: 12 },
    ],
  },
  {
    id: "cv3", inboxId: "ib_mail", contactId: "ct_leo", assigneeId: "usr_3",
    status: "snoozed", priority: "low", slaDueAt: base + 120 * MIN, labels: [], unread: 0,
    messages: [
      { id: "m5", conversationId: "cv3", direction: "in", authorType: "contact", authorId: "ct_leo", body: "Pro'ya nasıl yükseltirim?", tMinutes: 240 },
      { id: "m6", conversationId: "cv3", direction: "out", authorType: "agent", authorId: "usr_3", body: "Yükseltme bağlantısını gönderdim.", tMinutes: 180 },
    ],
  },
  {
    id: "cv4", inboxId: "ib_chat", contactId: "ct_jordan", assigneeId: "usr_1",
    status: "resolved", priority: "medium", slaDueAt: base - 600 * MIN, labels: ["billing"], unread: 0, csat: 5,
    messages: [
      { id: "m7", conversationId: "cv4", direction: "in", authorType: "contact", authorId: "ct_jordan", body: "Teşekkürler, düzeldi!", tMinutes: 600 },
    ],
  },
];

export const MACROS: Macro[] = [
  {
    id: "mac_refund", name: "İade işle",
    actions: [
      { type: "reply", value: "İadenizi başlattım — 5–7 iş günü içinde hesabınıza geçecek." },
      { type: "label", value: "refund" },
      { type: "status", value: "resolved" },
    ],
  },
  {
    id: "mac_escalate", name: "Tier 2'ye yükselt",
    actions: [
      { type: "priority", value: "urgent" },
      { type: "assign", value: "usr_1" },
      { type: "reply", value: "Bunu kıdemli ekibe yönlendiriyorum." },
    ],
  },
];

export const CANNED: CannedResponse[] = [
  { id: "cn_hi", shortcode: "/selam", body: "Merhaba {{name}}, ulaştığın için teşekkürler — nasıl yardımcı olabilirim?" },
  { id: "cn_refund", shortcode: "/iade", body: "{{plan}} planı için iaden işleniyor." },
  { id: "cn_hours", shortcode: "/saat", body: "Ekibimiz 09:00–18:00 (Europe/Istanbul) arası müsait." },
];

/** Bilgi bankası makaleleri — konuşma içi arama/öneri için. */
export const KB_ARTICLES: KbArticle[] = [
  { id: "kb_billing", title: "Yanlış faturayı düzeltme", body: "Faturalar orantısal olarak yeniden hesaplanır. Faturalama dönemini ve uygulanan kredileri kontrol edin." },
  { id: "kb_export", title: "Dışa aktarma 500 hatası", body: "Büyük dışa aktarmalarda bilinen bir sorun; biz düzeltirken daha küçük bir tarih aralığıyla tekrar deneyin." },
  { id: "kb_upgrade", title: "Planınızı yükseltme", body: "Ayarlar → Faturalama → Plan değiştir adımlarını izleyin. Yıllık ödemede %20 tasarruf edersiniz." },
];

/* ─────────── Bot akışı seed ─────────── */

export const SEED_FLOWS: BotFlow[] = [
  {
    id: "flow_triage",
    name: "Destek triyajı",
    startId: "n_welcome",
    nodes: [
      { id: "n_welcome", kind: "message", text: "Merhaba! Bugün nasıl yardımcı olabiliriz?", next: "n_intent" },
      {
        id: "n_intent", kind: "question", text: "Bir konu seç",
        options: [
          { label: "Fatura", next: "n_vip" },
          { label: "Teknik", next: "n_tech" },
          { label: "Diğer", next: "n_handoff" },
        ],
      },
      { id: "n_vip", kind: "condition", text: "VIP müşteri mi?", variable: "tier", equals: "vip", yes: "n_handoff", no: "n_collect" },
      { id: "n_collect", kind: "collect", text: "Fatura detayları", fields: [{ id: "order", label: "Sipariş No" }, { id: "email", label: "E-posta" }], next: "n_handoff" },
      { id: "n_tech", kind: "message", text: "Yeniden başlatıp status.aura.dev adresini kontrol edin", next: "n_resolve" },
      { id: "n_resolve", kind: "end", text: "Çözüldü" },
      { id: "n_handoff", kind: "handoff", text: "İnsan temsilciye yönlendir" },
    ],
  },
  {
    id: "flow_lead",
    name: "Lead yakalama",
    startId: "l_welcome",
    nodes: [
      { id: "l_welcome", kind: "message", text: "İlginiz için teşekkürler!", next: "l_form" },
      { id: "l_form", kind: "collect", text: "Bize kendinizden bahsedin", fields: [{ id: "name", label: "Ad" }, { id: "company", label: "Şirket" }], next: "l_route" },
      { id: "l_route", kind: "handoff", text: "Satışa yönlendir" },
    ],
  },
];

/* ─────────── WFO / WEM seed ─────────── */

export const WFO_AHT_SEC = 240;
export const WFO_INTERVAL_SEC = 1800; // 30 dk
export const WFO_OCCUPANCY = 0.85;

export const STAFFING: StaffingInterval[] = [
  { id: "i_09", label: "09:00", forecastVolume: 12, required: 2, scheduled: 3 },
  { id: "i_10", label: "10:00", forecastVolume: 25, required: 4, scheduled: 3 },
  { id: "i_11", label: "11:00", forecastVolume: 30, required: 5, scheduled: 4 },
  { id: "i_12", label: "12:00", forecastVolume: 16, required: 3, scheduled: 3 },
];

export const SHIFTS: Shift[] = [
  { id: "sh_1", agentId: "usr_1", start: "09:00", end: "17:00" },
  { id: "sh_2", agentId: "usr_3", start: "10:00", end: "18:00" },
];

export const ADHERENCE: AdherenceRow[] = [
  { agentId: "usr_1", scheduledMin: 480, adherentMin: 462 },
  { agentId: "usr_3", scheduledMin: 480, adherentMin: 408 },
  { agentId: "usr_4", scheduledMin: 240, adherentMin: 240 },
];

export const SCORECARD: ScorecardCriterion[] = [
  { id: "sc_greet", label: "Karşılama & empati", weight: 1 },
  { id: "sc_resolve", label: "Çözüm kalitesi", weight: 3 },
  { id: "sc_tone", label: "Ton & netlik", weight: 2 },
  { id: "sc_compliance", label: "Uyumluluk", weight: 2 },
];

export const QA_EVALUATIONS: QaEvaluation[] = [
  { id: "qa_1", agentId: "usr_3", conversationId: "cv4", scores: { sc_greet: 5, sc_resolve: 4, sc_tone: 5, sc_compliance: 4 } },
];

/* ─────────── AI Agent Studio seed ─────────── */

export const STUDIO_AGENTS: StudioAgent[] = [
  {
    id: "ag_support",
    name: "Destek Konsiyerji",
    goal: "Yaygın fatura ve hesap sorularını çöz, karmaşık olan her şeyi bir insan temsilciye devret.",
    channels: ["webchat", "whatsapp"],
    status: "published",
    knowledge: [
      { id: "k_kb", label: "Yardım merkezi makaleleri", kind: "kb" },
      { id: "k_policy", label: "İade politikası", kind: "url" },
    ],
    tools: [
      { id: "t_ticket", label: "Talep oluştur", enabled: true },
      { id: "t_order", label: "Sipariş ara", enabled: true },
      { id: "t_refund", label: "İade başlat", enabled: false },
    ],
    intents: [
      { id: "ai_invoice", label: "Fatura sorusu", phrases: ["fatura", "ödeme", "ücret"], reply: "Son faturanı çekebilirim — fatura e-postanı doğrular mısın?" },
      { id: "ai_refund", label: "İade", phrases: ["iade", "para geri", "ücreti iptal"], reply: "İadeler 5–7 günde işlenir. Talebini kaydettim." },
      { id: "ai_reset", label: "Parola sıfırlama", phrases: ["parola", "sıfırla", "kilitlendim"], reply: "E-postana bir sıfırlama bağlantısı gönderdim." },
    ],
    metrics: { runs: 420, resolved: 318 },
  },
  {
    id: "ag_sales",
    name: "Satış Asistanı",
    goal: "Gelen lead'leri nitele ve doğru temsilciyle bir demo planla.",
    channels: ["webchat"],
    status: "draft",
    knowledge: [{ id: "k_pricing", label: "Fiyatlandırma sayfası", kind: "url" }],
    tools: [{ id: "t_book", label: "Toplantı planla", enabled: true }],
    intents: [
      { id: "ai_pricing", label: "Fiyatlandırma", phrases: ["fiyat", "maliyet", "ne kadar"], reply: "Planlar Başlangıç kademesinden başlıyor — hızlı bir demo planlayayım mı?" },
    ],
    metrics: { runs: 96, resolved: 51 },
  },
];
