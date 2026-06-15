export type Role = "owner" | "admin" | "member";
export type Presence = "available" | "busy" | "away" | "offline";

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  title: string;
  role: Role;
  presence: Presence;
  initials: string;
  color: string;
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Sahip",
  admin: "Yönetici",
  member: "Üye",
};

/** API'den gelen serbest rol metnini bilinen rollere normalize eder. */
export function normalizeRole(role: string): Role {
  const r = role?.toLowerCase();
  if (r === "owner" || r === "admin" || r === "member") return r;
  return "member";
}

/** Bilinmeyen rol için bile okunabilir etiket döner. */
export function roleLabel(role: string): string {
  return ROLE_LABEL[normalizeRole(role)] ?? role;
}

/** Ad/e-postadan baş harfleri üretir (avatar için). */
export function deriveInitials(name: string, email: string): string {
  const base = name?.trim() || email?.split("@")[0] || "?";
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

/** id/e-postadan deterministik avatar rengi üretir. */
const AVATAR_COLORS = [
  "#db2777", "#2563eb", "#0d9488", "#dc2626",
  "#0891b2", "#ea580c", "#7c3aed", "#16a34a",
];
export function deriveColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export const teamUsers: TeamUser[] = [
  { id: "u-1000", name: "Mert Acar", email: "mert@acme.com", title: "Kurucu / CEO", role: "owner", presence: "available", initials: "MA", color: "#db2777" },
  { id: "u-1001", name: "Selin Aydın", email: "selin@acme.com", title: "Operasyon Müdürü", role: "admin", presence: "available", initials: "SA", color: "#2563eb" },
  { id: "u-1002", name: "Deniz Korkmaz", email: "deniz@acme.com", title: "Satış Temsilcisi", role: "member", presence: "busy", initials: "DK", color: "#0d9488" },
  { id: "u-1003", name: "Eylül Şahin", email: "eylul@acme.com", title: "Destek Uzmanı", role: "member", presence: "away", initials: "EŞ", color: "#dc2626" },
  { id: "u-1004", name: "Burak Yıldız", email: "burak@acme.com", title: "Teknik Lider", role: "admin", presence: "offline", initials: "BY", color: "#0891b2" },
  { id: "u-1005", name: "Ada Çelik", email: "ada@acme.com", title: "Satış Temsilcisi", role: "member", presence: "available", initials: "AÇ", color: "#ea580c" },
];
