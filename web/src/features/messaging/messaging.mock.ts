export interface ChatMessage {
  id: string;
  mine?: boolean;
  author?: string;
  initials?: string;
  color?: string;
  at: string;
  text?: string;
  system?: boolean;
}

export type Section = "inbox" | "dm" | "channels";

export interface Conversation {
  id: string;
  name: string; // başlık (kanal için # olmadan)
  sub?: string; // e-posta / ünvan / konu
  initials: string;
  color: string;
  presence?: "available" | "busy" | "away" | "offline";
  unread?: number;
  preview: string;
  time: string;
  messages: ChatMessage[];
}

const ME = { initials: "SA", color: "#2563eb" };

export const inboxThreads: Conversation[] = [
  {
    id: "cv-501", name: "Ali Vural", sub: "ali@x.com", initials: "AV", color: "#2563eb",
    unread: 2, time: "09:42", preview: "Faturada bir tutarsızlık görüyorum...",
    messages: [
      { id: "m1", author: "Ali Vural", initials: "AV", color: "#2563eb", at: "09:31", text: "Merhaba, geçen ayki siparişimle ilgili bir sorum olacaktı." },
      { id: "m2", mine: true, at: "09:35", text: "Merhaba Ali Bey, tabii. Sipariş numaranızı paylaşır mısınız?" },
      { id: "m3", author: "Ali Vural", initials: "AV", color: "#2563eb", at: "09:38", text: "ACM-2026-0431" },
      { id: "m4", system: true, at: "09:39", text: "Selin Aydın görüşmeyi devraldı" },
      { id: "m5", author: "Ali Vural", initials: "AV", color: "#2563eb", at: "09:42", text: "Faturada bir tutarsızlık görüyorum, kontrol eder misiniz?" },
    ],
  },
  {
    id: "cv-503", name: "Okan Demir", sub: "okan@z.com", initials: "OD", color: "#0891b2",
    unread: 5, time: "08:15", preview: "Premium plana geçmek istiyorum...",
    messages: [
      { id: "m1", author: "Okan Demir", initials: "OD", color: "#0891b2", at: "08:05", text: "Selam!" },
      { id: "m2", author: "Okan Demir", initials: "OD", color: "#0891b2", at: "08:15", text: "Premium plana geçmek istiyorum, nasıl yapabilirim?" },
    ],
  },
  {
    id: "cv-508", name: "Nazlı Güneş", sub: "nazli@q.com", initials: "NG", color: "#db2777",
    unread: 3, time: "06:20", preview: "Toplu lisans fiyatlandırması?",
    messages: [
      { id: "m1", author: "Nazlı Güneş", initials: "NG", color: "#db2777", at: "06:20", text: "Toplu lisans fiyatlandırması hakkında bilgi alabilir miyim?" },
    ],
  },
  {
    id: "cv-506", name: "İpek Yalçın", sub: "ipek@n.com", initials: "İY", color: "#0d9488",
    time: "30 May", preview: "Harika, görüşmek üzere.",
    messages: [
      { id: "m1", author: "İpek Yalçın", initials: "İY", color: "#0d9488", at: "30 May 16:40", text: "Demo için müsait misiniz?" },
      { id: "m2", mine: true, at: "30 May 16:45", text: "Tabii, yarın 14:00 uygun." },
      { id: "m3", author: "İpek Yalçın", initials: "İY", color: "#0d9488", at: "30 May 16:48", text: "Harika, görüşmek üzere." },
    ],
  },
];

export const dmThreads: Conversation[] = [
  {
    id: "u-1000", name: "Mert Acar", sub: "Kurucu / CEO", initials: "MA", color: "#db2777",
    presence: "available", time: "10:05", preview: "Toplantıyı 15:00'a alalım.",
    messages: [
      { id: "m1", author: "Mert Acar", initials: "MA", color: "#db2777", at: "09:58", text: "Selin, yeni müşteri demosu için hazırlık nasıl gidiyor?" },
      { id: "m2", mine: true, at: "10:01", text: "İyi gidiyor, sunumu bitirdim." },
      { id: "m3", author: "Mert Acar", initials: "MA", color: "#db2777", at: "10:05", text: "Toplantıyı 15:00'a alalım." },
    ],
  },
  {
    id: "u-1002", name: "Deniz Korkmaz", sub: "Satış Temsilcisi", initials: "DK", color: "#0d9488",
    presence: "busy", unread: 2, time: "09:30", preview: "Bu lead'i sana aktardım.",
    messages: [
      { id: "m1", author: "Deniz Korkmaz", initials: "DK", color: "#0d9488", at: "09:28", text: "Selam!" },
      { id: "m2", author: "Deniz Korkmaz", initials: "DK", color: "#0d9488", at: "09:30", text: "Bu lead'i sana aktardım, bakar mısın?" },
    ],
  },
  {
    id: "u-1003", name: "Eylül Şahin", sub: "Destek Uzmanı", initials: "EŞ", color: "#dc2626",
    presence: "away", time: "Dün", preview: "Ticket'ı kapattım ✅",
    messages: [
      { id: "m1", mine: true, at: "Dün 17:00", text: "Hakan'ın ticket'ına bakabildin mi?" },
      { id: "m2", author: "Eylül Şahin", initials: "EŞ", color: "#dc2626", at: "Dün 17:20", text: "Ticket'ı kapattım ✅" },
    ],
  },
];

export const channels: Conversation[] = [
  {
    id: "genel", name: "genel", sub: "Şirket geneli duyurular", initials: "#", color: "#2563eb",
    time: "09:20", preview: "Bu hafta demo yoğunluğu var.",
    messages: [
      { id: "m1", author: "Mert Acar", initials: "MA", color: "#db2777", at: "09:10", text: "Günaydın ekip! Bu hafta demo yoğunluğu var, hazırlıklı olalım." },
      { id: "m2", author: "Eylül Şahin", initials: "EŞ", color: "#dc2626", at: "09:14", text: "Ben destek tarafını topladım, ticket backlog temiz." },
      { id: "m3", mine: true, at: "09:20", text: "Harika. @Burak deploy planı hazır mı?" },
    ],
  },
  {
    id: "satis", name: "satış", sub: "Satış fırsatları ve lead'ler", initials: "#", color: "#2563eb",
    unread: 5, time: "08:55", preview: "Yeni kurumsal lead geldi — 250 kullanıcı.",
    messages: [
      { id: "m1", author: "Deniz Korkmaz", initials: "DK", color: "#0d9488", at: "08:50", text: "Yeni kurumsal lead geldi — 250 kullanıcı." },
      { id: "m2", author: "Ada Çelik", initials: "AÇ", color: "#ea580c", at: "08:55", text: "Ben alıyorum, teklif hazırlıyorum." },
    ],
  },
  {
    id: "urun", name: "ürün", sub: "Ürün & mühendislik", initials: "#", color: "#2563eb",
    time: "Dün", preview: "v0.2 release notları hazır.",
    messages: [
      { id: "m1", author: "Burak Yıldız", initials: "BY", color: "#0891b2", at: "Dün", text: "v0.2 release notları hazır, gözden geçirir misiniz?" },
    ],
  },
];

export const me = ME;

const MAP: Record<Section, Conversation[]> = {
  inbox: inboxThreads,
  dm: dmThreads,
  channels,
};

export function listFor(section: Section): Conversation[] {
  return MAP[section] ?? [];
}

export function findConversation(section: Section, id?: string): Conversation | undefined {
  const list = listFor(section);
  return list.find((c) => c.id === id) ?? list[0];
}
