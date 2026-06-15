/**
 * Ham backend listelerini, mevcut widget'ların beklediği görünüm
 * modellerine dönüştüren saf (pure) yardımcılar.
 */
import type {
  DashUser,
  DashAppointment,
  DashMeeting,
  DashConversation,
} from "./dashboard.api";
import type { Stat, BookingStatus } from "./dashboard.mock";

const AVATAR_COLORS = [
  "#2563eb",
  "#0d9488",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#7c3aed",
  "#16a34a",
];

export function initialsOf(name: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** İsme göre kararlı (deterministik) renk seçer. */
export function colorOf(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Sahip",
  admin: "Yönetici",
  member: "Üye",
  user: "Üye",
};
export function roleLabel(role: string): string {
  return ROLE_LABEL[role?.toLowerCase()] ?? role ?? "Üye";
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** ISO tarihi "5 Haz · 15:00" gibi biçimler. */
export function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const today = startOfDay(new Date()).getTime();
  const day = startOfDay(d).getTime();
  const hm = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (day === today) return hm;
  if (day === today + 86400000) return `Yarın ${hm}`;
  return `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} ${hm}`;
}

function isThisWeek(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const start = startOfDay(now);
  const dow = (start.getDay() + 6) % 7; // Pazartesi = 0
  start.setDate(start.getDate() - dow);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}

export interface DashInputs {
  users: DashUser[];
  appointments: DashAppointment[];
  meetings: DashMeeting[];
  conversations: DashConversation[];
}

/** Üst sıradaki 4 istatistik kartı — gerçek liste uzunluklarından. */
export function deriveStats({
  users,
  appointments,
  meetings,
  conversations,
}: DashInputs): Stat[] {
  const openInbox = conversations.filter(
    (c) => (c.status ?? "").toLowerCase() !== "resolved" &&
      (c.status ?? "").toLowerCase() !== "closed",
  ).length;
  const upcomingMeetings = meetings.filter(
    (m) => m.scheduled_at && new Date(m.scheduled_at) >= new Date(),
  ).length;
  const weekAppts = appointments.filter((a) => isThisWeek(a.start_at)).length;
  const onlineMembers = users.filter((u) => u.is_active).length;

  return [
    {
      label: "Açık inbox",
      value: String(openInbox),
      delta: `${conversations.length} toplam`,
      up: true,
      icon: "inbox",
      tint: "blue",
    },
    {
      label: "Yaklaşan toplantı",
      value: String(upcomingMeetings),
      delta: `${meetings.length} toplam`,
      up: true,
      icon: "video",
      tint: "green",
    },
    {
      label: "Bu hafta randevu",
      value: String(weekAppts),
      delta: `${appointments.length} toplam`,
      up: true,
      icon: "calendar",
      tint: "yellow",
    },
    {
      label: "Ekip üyesi",
      value: String(users.length),
      delta: `${onlineMembers} aktif`,
      up: true,
      icon: "users",
      tint: "teal",
    },
  ];
}

export interface UpcomingMeetingVM {
  id: string;
  title: string;
  time: string;
  duration: string;
  joinUrl: string | null;
}

export function deriveUpcomingMeetings(meetings: DashMeeting[]): UpcomingMeetingVM[] {
  const now = new Date();
  return meetings
    .filter((m) => !m.scheduled_at || new Date(m.scheduled_at) >= now)
    .sort((a, b) => {
      const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity;
      const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity;
      return ta - tb;
    })
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      title: m.title,
      time: fmtTime(m.scheduled_at),
      duration: `${m.duration_minutes} dk`,
      joinUrl: m.join_url,
    }));
}

export interface TeamMemberVM {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  presence: string;
}

export function deriveTeam(users: DashUser[]): TeamMemberVM[] {
  return users.map((u) => ({
    id: u.id,
    name: u.full_name || u.email,
    role: roleLabel(u.role),
    initials: initialsOf(u.full_name || u.email),
    color: colorOf(u.id || u.email),
    presence: u.is_active ? "available" : "offline",
  }));
}

const APPT_STATUS: Record<string, BookingStatus> = {
  scheduled: "onaylı",
  confirmed: "onaylı",
  pending: "bekliyor",
  cancelled: "iptal",
  canceled: "iptal",
};

export interface BookingVM {
  who: string;
  email: string;
  type: string;
  date: string;
  status: BookingStatus;
}

/** Randevuları "Son rezervasyonlar" tablosuna dönüştürür. */
export function deriveBookings(appointments: DashAppointment[]): BookingVM[] {
  return [...appointments]
    .sort(
      (a, b) =>
        new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
    )
    .slice(0, 6)
    .map((a) => {
      const email = a.attendee_emails?.[0] ?? "";
      const who = email ? email.split("@")[0] : a.title;
      return {
        who,
        email,
        type: a.title,
        date: fmtDateTime(a.start_at),
        status: APPT_STATUS[(a.status ?? "").toLowerCase()] ?? "bekliyor",
      };
    });
}

export interface ActivityVM {
  who: string;
  initials: string;
  color: string;
  action: string;
  time: string;
}

/**
 * "Son aktivite" — gerçek bir activity-feed ucu olmadığından,
 * son oluşturulan toplantı/randevu/konuşmalardan türetilir.
 */
export function deriveActivity(inputs: DashInputs): ActivityVM[] {
  type Item = { who: string; action: string; ts: number };
  const items: Item[] = [];

  for (const m of inputs.meetings) {
    items.push({
      who: m.title,
      action: "toplantısı oluşturuldu",
      ts: m.scheduled_at ? new Date(m.scheduled_at).getTime() : 0,
    });
  }
  for (const a of inputs.appointments) {
    const who = a.attendee_emails?.[0]?.split("@")[0] ?? a.title;
    items.push({
      who,
      action: `randevusu alındı — ${a.title}`,
      ts: new Date(a.start_at).getTime() || 0,
    });
  }
  for (const c of inputs.conversations) {
    items.push({
      who: c.contact_name || "Konuşma",
      action: "inbox'ta konuşma açıldı",
      ts: 0,
    });
  }

  return items
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5)
    .map((it) => ({
      who: it.who,
      initials: initialsOf(it.who),
      color: colorOf(it.who),
      action: it.action,
      time: it.ts ? fmtTime(new Date(it.ts).toISOString()) : "—",
    }));
}
