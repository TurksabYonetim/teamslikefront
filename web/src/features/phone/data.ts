import type {
  BusinessHours,
  CallQueue,
  HuntGroup,
  IVRMenu,
  PhoneLine,
  ReceptionistConfig,
  RoutingRule,
  SmsTemplate,
  SmsThread,
  Voicemail,
} from "./phone.types";

/**
 * Telefon modülü mock seed'i. Canlı çağrı state'i createStore'da yaşar; geçmiş ve
 * rehber gerçek API'den gelir. Bu seed voicemail/SMS/PBX/IVR/resepsiyon gibi
 * backend'i olmayan yüzeyleri besler (epoch ms; sabit ofsetler, Date.now kullanılmaz).
 */

const HOUR = 3_600_000;
const DAY = 86_400_000;
// Deterministik testler için sabit referans an (epoch ms). Mutlak tarih önemli
// değil; tüm seed zaman damgaları bundan göreli ofsetlerle türetilir.
const NOW = 1_780_000_000_000;

export const LINES: PhoneLine[] = [
  {
    id: "line_main",
    e164: "+14155551000",
    label: "Aura Labs — Ana Hat",
    extensions: [
      { id: "ext_101", number: "101", label: "Resepsiyon" },
      { id: "ext_102", number: "102", label: "Satış" },
      { id: "ext_103", number: "103", label: "Destek" },
    ],
    delegates: [{ id: "del_1", name: "Asistan", canAnswer: true, canPlaceOnBehalf: false }],
  },
];

export const ROUTING_RULES: RoutingRule[] = [
  { id: "rr_always", lineId: "line_main", condition: "always", action: "forward", target: "101" },
  { id: "rr_after", lineId: "line_main", condition: "afterHours", action: "voicemail" },
  { id: "rr_busy", lineId: "line_main", condition: "busy", action: "ivr", target: "ivr_main" },
];

export const VOICEMAILS: Voicemail[] = [
  {
    id: "vm_1",
    lineId: "line_main",
    from: "+14155559876",
    receivedAt: NOW - 2 * HOUR,
    durationSec: 34,
    transcript: "Hi, this is Dana — please call me back about the proposal.",
    heard: false,
  },
  {
    id: "vm_2",
    lineId: "line_main",
    from: "+14155551234",
    receivedAt: NOW - DAY,
    durationSec: 12,
    heard: true,
  },
];

export const SMS_THREADS: SmsThread[] = [
  {
    id: "sms_1",
    contact: "Jordan Blake",
    e164: "+14155551234",
    unread: 1,
    messages: [
      { id: "m1", threadId: "sms_1", from: "+14155551234", to: "+14155551000", body: "Are we still on for 3pm?", sentAt: NOW - 50 * 60_000, outbound: false },
      { id: "m2", threadId: "sms_1", from: "+14155551000", to: "+14155551234", body: "Yes — see you then.", sentAt: NOW - 40 * 60_000, outbound: true },
      { id: "m3", threadId: "sms_1", from: "+14155551234", to: "+14155551000", body: "Great, thanks!", sentAt: NOW - 5 * 60_000, outbound: false },
    ],
  },
  {
    id: "sms_2",
    contact: "Acme Procurement",
    e164: "+14155550111",
    unread: 0,
    messages: [
      { id: "m4", threadId: "sms_2", from: "+14155551000", to: "+14155550111", body: "PO received, processing now.", sentAt: NOW - 3 * HOUR, outbound: true },
    ],
  },
];

export const SMS_TEMPLATES: SmsTemplate[] = [
  { id: "tpl_1", name: "Randevu hatırlatma", body: "Merhaba {{name}}, {{time}} randevunuzu hatırlatırız." },
  { id: "tpl_2", name: "Geri arama", body: "Sizi aradık {{name}}, uygun olduğunuzda dönebilir misiniz?" },
];

export const CALL_QUEUES: CallQueue[] = [
  {
    id: "queue_sales",
    name: "Satış",
    lineId: "line_main",
    strategy: "round_robin",
    maxWaitSec: 300,
    overflowAction: "voicemail",
    agents: [
      { id: "ag_1", name: "Ece Y.", idleSec: 45, available: true, skills: ["tr", "sales"], weight: 2 },
      { id: "ag_2", name: "Mert K.", idleSec: 120, available: true, skills: ["tr", "en"], weight: 1 },
      { id: "ag_3", name: "Sara L.", idleSec: 10, available: false, skills: ["en"], weight: 3 },
    ],
    waiting: [
      { id: "wq_1", from: "+14155552222", since: NOW - 90_000 },
      { id: "wq_2", from: "+14155553333", since: NOW - 30_000, callbackRequested: true },
    ],
  },
];

export const HUNT_GROUPS: HuntGroup[] = [
  {
    id: "hunt_support",
    name: "Destek Hattı",
    ring: "sequential",
    members: [
      { id: "hm_1", name: "Deniz A.", available: true },
      { id: "hm_2", name: "Kaan T.", available: false },
      { id: "hm_3", name: "Lara M.", available: true },
    ],
  },
];

export const IVR_MENUS: IVRMenu[] = [
  {
    id: "ivr_main",
    name: "Ana Menü",
    greeting: "Aura Labs'a hoş geldiniz. Satış için 1, destek için 2'ye basın.",
    options: [
      { key: "1", label: "Satış", action: "queue", target: "queue_sales" },
      { key: "2", label: "Destek", action: "extension", target: "103" },
      { key: "0", label: "Resepsiyon", action: "extension", target: "101" },
    ],
  },
];

export const BUSINESS_HOURS: BusinessHours[] = [
  {
    id: "hours_default",
    name: "Mesai Saatleri",
    timezone: "Europe/Istanbul",
    weekly: [
      { day: 1, openMin: 9 * 60, closeMin: 18 * 60 },
      { day: 2, openMin: 9 * 60, closeMin: 18 * 60 },
      { day: 3, openMin: 9 * 60, closeMin: 18 * 60 },
      { day: 4, openMin: 9 * 60, closeMin: 18 * 60 },
      { day: 5, openMin: 9 * 60, closeMin: 17 * 60 },
    ],
    holidays: [],
  },
];

export const RECEPTIONIST_CONFIG: ReceptionistConfig = {
  id: "rcp_1",
  enabled: true,
  greeting: "Merhaba, ben Aura'nın yapay zekâ resepsiyonistiyim. Size nasıl yardımcı olabilirim?",
  afterHoursGreeting: "Şu anda kapalıyız. Mesaj bırakırsanız ekibimiz sizi arayacaktır.",
  hoursId: "hours_default",
  captureFields: ["name", "phone", "reason"],
  fallback: "voicemail",
  smsFollowUp: true,
  intents: [
    { id: "int_sales", label: "Satış", phrases: ["fiyat", "satın al", "pricing plan"], action: "route_queue", target: "queue_sales" },
    { id: "int_support", label: "Destek", phrases: ["arıza", "çalışmıyor", "destek"], action: "route_extension", target: "103" },
    { id: "int_hours", label: "Çalışma saatleri", phrases: ["kaçta açık", "çalışma saatleri"], action: "answer_faq", answer: "Hafta içi 09:00–18:00 arası açığız." },
  ],
};
