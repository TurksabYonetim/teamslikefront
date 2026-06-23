/** Portal görünüm yardımcıları (avatar rengi/baş harfleri, zaman biçimi). */
import { formatTime } from "@/lib/dateFormat";

/** Deterministik avatar rengi (key'den; örn. user_id veya ad). */
const COLORS = ["#0d9488", "#dc2626", "#ea580c", "#2563eb", "#7c3aed", "#0891b2"];

export function colorFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function initialsOf(name?: string | null) {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** ISO/epoch → HH:MM (yerel). Geçersizse boş string. */
export const fmtTime = (iso?: string | null): string => formatTime(iso);
