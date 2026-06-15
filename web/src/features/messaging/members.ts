// web/src/features/messaging/members.ts
export type Presence = "online" | "away" | "offline";

export interface Member {
  id: string;
  name: string;
  presence: Presence;
}

/** Geçerli kullanıcı (mock). */
export const ME_ID = "usr_1";

export const MEMBERS: Member[] = [
  { id: "usr_1", name: "Siz", presence: "online" },
  { id: "usr_2", name: "Defne Yıldız", presence: "online" },
  { id: "usr_3", name: "Marco Rossi", presence: "away" },
  { id: "usr_4", name: "Priya N.", presence: "offline" },
  { id: "usr_5", name: "Jordan Blake", presence: "online" },
  { id: "usr_6", name: "Aylin Kaya", presence: "away" },
];

export const memberById = (id: string): Member | undefined =>
  MEMBERS.find((m) => m.id === id);

export const memberName = (id: string): string => memberById(id)?.name ?? id;

export const presenceOf = (id: string): Presence => memberById(id)?.presence ?? "offline";

/** Deterministik avatar rengi (hash → sabit palet). */
const AVATAR_COLORS = ["#5b5fc7", "#1d4ed8", "#0e9f6e", "#d97706", "#db2777", "#6d28d9"];
export function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** İsimden en çok 2 harfli baş harfler. */
export function initialsFor(name?: string): string {
  if (!name || !name.trim()) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
