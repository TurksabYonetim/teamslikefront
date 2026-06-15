/**
 * Gösterge paneli için temsili veri. Backend geldiğinde
 * features/dashboard/dashboard.api.ts + TanStack Query ile değiştirilecek.
 */

export interface Stat {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: string;
  tint: "blue" | "green" | "yellow" | "teal";
}

export const stats: Stat[] = [
  { label: "Açık inbox", value: "8", delta: "+3 bugün", up: true, icon: "inbox", tint: "blue" },
  { label: "Yaklaşan toplantı", value: "5", delta: "2 bugün", up: true, icon: "video", tint: "green" },
  { label: "Bu hafta randevu", value: "12", delta: "+4", up: true, icon: "calendar", tint: "yellow" },
  { label: "Ekip üyesi", value: "6", delta: "4 çevrimiçi", up: true, icon: "users", tint: "teal" },
];

/** Haftalık aktivite — gruplu bar grafiği (mesaj + toplantı). */
export const weekly = [
  { day: "Pzt", messages: 32, meetings: 4 },
  { day: "Sal", messages: 41, meetings: 6 },
  { day: "Çar", messages: 28, meetings: 3 },
  { day: "Per", messages: 50, meetings: 7 },
  { day: "Cum", messages: 38, meetings: 5 },
  { day: "Cmt", messages: 12, meetings: 1 },
  { day: "Paz", messages: 8, meetings: 0 },
];

/** Görev ilerlemesi — donut. */
export const taskProgress = { done: 24, total: 36 };

export const upcomingMeetings = [
  { title: "Acme x Müşteri — Demo", time: "15:00", duration: "45 dk", host: "Selin Aydın", attendees: 4 },
  { title: "Haftalık Satış Sync", time: "17:30", duration: "30 dk", host: "Mert Acar", attendees: 6 },
  { title: "Teknik Mimari Gözden Geçirme", time: "Yarın 11:00", duration: "60 dk", host: "Burak Yıldız", attendees: 3 },
];

export const activity = [
  { who: "Deniz Korkmaz", initials: "DK", color: "#0d9488", action: "yeni bir lead ekledi — Kurumsal (250 kullanıcı)", time: "5 dk önce" },
  { who: "Eylül Şahin", initials: "EŞ", color: "#dc2626", action: "bir destek ticket'ını kapattı", time: "22 dk önce" },
  { who: "Ali Vural", initials: "AV", color: "#2563eb", action: "inbox'a yeni mesaj yazdı", time: "1 saat önce" },
  { who: "Mert Acar", initials: "MA", color: "#db2777", action: "Haftalık Satış Sync toplantısını oluşturdu", time: "2 saat önce" },
  { who: "Ada Çelik", initials: "AÇ", color: "#ea580c", action: "İpek Yalçın için sözleşme randevusu aldı", time: "3 saat önce" },
];

export type BookingStatus = "onaylı" | "bekliyor" | "iptal";
export const recentBookings: {
  who: string;
  email: string;
  type: string;
  date: string;
  status: BookingStatus;
}[] = [
  { who: "Ali Vural", email: "ali@x.com", type: "Ürün demosu", date: "1 Haz · 15:00", status: "onaylı" },
  { who: "Nazlı Güneş", email: "nazli@q.com", type: "Tanışma görüşmesi", date: "1 Haz · 16:30", status: "onaylı" },
  { who: "Okan Demir", email: "okan@z.com", type: "Danışmanlık", date: "29 May · 14:00", status: "bekliyor" },
  { who: "Hakan Çetin", email: "hakan@m.com", type: "Satış görüşmesi", date: "2 Haz · 11:00", status: "onaylı" },
  { who: "İpek Yalçın", email: "ipek@n.com", type: "Ürün demosu", date: "28 May · 10:00", status: "iptal" },
];

export const team = [
  { name: "Mert Acar", role: "Sahip", initials: "MA", color: "#db2777", presence: "available" },
  { name: "Selin Aydın", role: "Yönetici", initials: "SA", color: "#2563eb", presence: "available" },
  { name: "Deniz Korkmaz", role: "Üye", initials: "DK", color: "#0d9488", presence: "busy" },
  { name: "Eylül Şahin", role: "Üye", initials: "EŞ", color: "#dc2626", presence: "away" },
  { name: "Burak Yıldız", role: "Yönetici", initials: "BY", color: "#0891b2", presence: "offline" },
  { name: "Ada Çelik", role: "Üye", initials: "AÇ", color: "#ea580c", presence: "available" },
];
