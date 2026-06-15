export interface EventType {
  id: string;
  title: string;
  slug: string;
  duration: number;
  location: string;
  color: string;
  desc: string;
  bookings: number;
  price: string | null;
  kind: "solo" | "roundrobin" | "collective";
  hidden: boolean;
}

/**
 * Admin (BookingPage) tablosundaki "etkinlik" kaydı. Flowbite events.html
 * tablosunun kolonlarıyla birebir eşleşir ve useLocalCrud için seed'dir.
 */
export interface BookingEvent {
  id: string;
  title: string;
  description: string;
  /** ISO veya serbest metin başlangıç tarihi (örn. "02 Dec 2025") */
  date: string;
  /** Süre değeri + birimi (i18n için ayrı tutulur) */
  durationCount: number;
  durationUnit: "days" | "hours" | "weeks";
  location: string;
  meetUrl: string;
  seatsTaken: number;
  seatsTotal: number;
  /** Tailwind renk anahtarı (createEvent renk paletinden) */
  color: string;
}

/** useLocalCrud anahtarları */
export const EVENTS_KEY = "booking_events";
export const BOOKINGS_KEY = "booking_reservations";
export const EVENT_TYPES_KEY = "booking_event_types";

/** Tag color paleti — create/update drawer'daki renk butonlarıyla aynı sıra. */
export const TAG_COLORS = [
  "bg-purple-500",
  "bg-indigo-500",
  "bg-primary-600",
  "bg-pink-500",
  "bg-teal-400",
  "bg-green-400",
  "bg-yellow-300",
  "bg-orange-400",
  "bg-red-500",
] as const;

/**
 * BookingPage tablosu için seed. booking.mock'taki etkinlik verisinden
 * türetilir; her kayıtta benzersiz id bulunur.
 */
export const bookingEventsSeed: BookingEvent[] = [
  { id: "evt-mtech", title: "MTech Expo", description: "Yapay zeka ve donanım odaklı yıllık teknoloji fuarı.", date: "02 Dec 2025", durationCount: 3, durationUnit: "days", location: "Istanbul, Türkiye", meetUrl: "https://meet.google.com/vek-abcd-efg", seatsTaken: 875, seatsTotal: 1023, color: "bg-primary-600" },
  { id: "evt-mobilefest", title: "Mobilefest", description: "Mobil geliştirme ve ürün tasarımı zirvesi.", date: "17 Jan 2025", durationCount: 1, durationUnit: "days", location: "Berlin, Almanya", meetUrl: "https://meet.google.com/mob-ilef-est", seatsTaken: 2000, seatsTotal: 2000, color: "bg-pink-500" },
  { id: "evt-dx4", title: "The 4th Digital Transformation", description: "Dijital dönüşüm ve Endüstri 4.0 üzerine ücretsiz online konferans.", date: "26 Aug 2025", durationCount: 5, durationUnit: "days", location: "San Francisco, California", meetUrl: "https://meet.google.com/dx4-conf-erence", seatsTaken: 540, seatsTotal: 1200, color: "bg-teal-400" },
  { id: "evt-devsummit", title: "Dev Summit", description: "Açık kaynak ve bulut yerel mimariler buluşması.", date: "11 Mar 2025", durationCount: 2, durationUnit: "days", location: "Amsterdam, Hollanda", meetUrl: "https://meet.google.com/dev-summ-it1", seatsTaken: 310, seatsTotal: 800, color: "bg-indigo-500" },
  { id: "evt-uxweek", title: "UX Week", description: "Kullanıcı deneyimi ve ürün tasarımı haftası.", date: "05 Sep 2025", durationCount: 1, durationUnit: "weeks", location: "Londra, Birleşik Krallık", meetUrl: "https://meet.google.com/ux-week-2025", seatsTaken: 120, seatsTotal: 300, color: "bg-purple-500" },
  { id: "evt-datacon", title: "DataCon", description: "Veri mühendisliği ve analitik konferansı.", date: "22 Oct 2025", durationCount: 6, durationUnit: "hours", location: "Ankara, Türkiye", meetUrl: "https://meet.google.com/dat-acon-202", seatsTaken: 410, seatsTotal: 500, color: "bg-orange-400" },
  { id: "evt-cloudnext", title: "Cloud Next", description: "Bulut altyapısı ve DevOps güncel gelişmeleri.", date: "14 Nov 2025", durationCount: 2, durationUnit: "days", location: "Dublin, İrlanda", meetUrl: "https://meet.google.com/clo-udne-xt0", seatsTaken: 95, seatsTotal: 600, color: "bg-green-400" },
];

/** Public rezervasyon formundan kaydedilen kayıt. */
export interface Reservation {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  topic: string;
  day: number | null;
  time: string | null;
  duration: number;
  createdAt: string;
}

export const eventTypes: EventType[] = [
  { id: "et-15", title: "Tanışma görüşmesi", slug: "intro-15", duration: 15, location: "Jitsi video", color: "#2563eb", desc: "Hızlı ön tanışma ve ihtiyaç analizi.", bookings: 42, price: null, kind: "solo", hidden: false },
  { id: "et-30", title: "Ürün demosu", slug: "demo-30", duration: 30, location: "Jitsi video", color: "#0d9488", desc: "Canlı ürün tanıtımı ve soru-cevap.", bookings: 128, price: null, kind: "solo", hidden: false },
  { id: "et-60", title: "Danışmanlık (ücretli)", slug: "consult-60", duration: 60, location: "Jitsi video", color: "#d97706", desc: "Birebir derinlemesine danışmanlık seansı.", bookings: 17, price: "₺1.500", kind: "solo", hidden: false },
  { id: "et-rr", title: "Satış ekibiyle görüşme", slug: "sales-rr", duration: 30, location: "Jitsi video", color: "#db2777", desc: "Round-robin: müsait ilk temsilciye atanır.", bookings: 64, price: null, kind: "roundrobin", hidden: false },
  { id: "et-col", title: "Onboarding (tüm ekip)", slug: "onboarding", duration: 45, location: "Jitsi video", color: "#0891b2", desc: "Collective: birden çok ekip üyesi katılır.", bookings: 9, price: null, kind: "collective", hidden: true },
];

export const KIND_LABEL: Record<EventType["kind"], string> = {
  solo: "Birebir",
  roundrobin: "Round-robin",
  collective: "Collective",
};

export const availability = {
  timezone: "Europe/Istanbul (GMT+3)",
  minNotice: "4 saat",
  days: [
    { day: "Pazartesi", on: true, ranges: [["09:00", "12:00"], ["13:00", "18:00"]] },
    { day: "Salı", on: true, ranges: [["09:00", "18:00"]] },
    { day: "Çarşamba", on: true, ranges: [["09:00", "18:00"]] },
    { day: "Perşembe", on: true, ranges: [["09:00", "18:00"]] },
    { day: "Cuma", on: true, ranges: [["09:00", "16:00"]] },
    { day: "Cumartesi", on: false, ranges: [] },
    { day: "Pazar", on: false, ranges: [] },
  ] as { day: string; on: boolean; ranges: string[][] }[],
  overrides: [
    { date: "5 Haz", label: "Tam gün izinli" },
    { date: "12 Haz", label: "Yarım gün (09:00–13:00)" },
  ],
};

export type BookingStatus = "upcoming" | "past" | "cancelled";
export const bookings: {
  id: string;
  title: string;
  who: string;
  email: string;
  date: string;
  time: string;
  host: string;
  status: BookingStatus;
}[] = [
  { id: "bk-1", title: "Ürün demosu", who: "Ali Vural", email: "ali@x.com", date: "1 Haz", time: "15:00", host: "Selin Aydın", status: "upcoming" },
  { id: "bk-2", title: "Tanışma görüşmesi", who: "Nazlı Güneş", email: "nazli@q.com", date: "1 Haz", time: "16:30", host: "Deniz Korkmaz", status: "upcoming" },
  { id: "bk-3", title: "Satış görüşmesi", who: "Hakan Çetin", email: "hakan@m.com", date: "2 Haz", time: "11:00", host: "Ada Çelik", status: "upcoming" },
  { id: "bk-4", title: "Danışmanlık", who: "Okan Demir", email: "okan@z.com", date: "29 May", time: "14:00", host: "Selin Aydın", status: "past" },
  { id: "bk-5", title: "Ürün demosu", who: "İpek Yalçın", email: "ipek@n.com", date: "28 May", time: "10:00", host: "Selin Aydın", status: "cancelled" },
];

export const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"];
export const availableDays = new Set([1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30]);
