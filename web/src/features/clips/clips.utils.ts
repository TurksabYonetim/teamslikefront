import type { Clip } from "./clips.types";

/** Saniyeyi mm:ss (gerekirse h:mm:ss) biçimine çevirir. */
export function formatDuration(s: number | null | undefined): string {
  if (s == null || !Number.isFinite(s) || s < 0) return "";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${m}:${pad(sec)}`;
}

/**
 * video_url için yumuşak doğrulama. Boş ya da http(s)/protokol-relatif/relative
 * yollar geçerli sayılır; sadece bariz hatalı girdileri yakalar.
 */
export function isValidVideoUrl(raw: string): boolean {
  const url = raw.trim();
  if (!url) return false;
  // protokol-relatif veya kök-relatif yollar
  if (url.startsWith("//") || url.startsWith("/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type ClipSort = "newest" | "oldest" | "longest" | "shortest" | "title";

export const CLIP_SORTS: ClipSort[] = [
  "newest",
  "oldest",
  "longest",
  "shortest",
  "title",
];

function durationValue(c: Clip): number {
  return c.duration_s ?? -1;
}

function createdValue(c: Clip): number {
  const t = Date.parse(c.created_at);
  return Number.isFinite(t) ? t : 0;
}

/** Arama (başlık+açıklama) ve sıralama uygular; orijinal diziyi bozmaz. */
export function filterAndSortClips(
  clips: Clip[],
  query: string,
  sort: ClipSort,
): Clip[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? clips.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      )
    : clips.slice();

  const sorted = filtered.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return createdValue(a) - createdValue(b);
      case "longest":
        return durationValue(b) - durationValue(a);
      case "shortest":
        return durationValue(a) - durationValue(b);
      case "title":
        return a.title.localeCompare(b.title);
      case "newest":
      default:
        return createdValue(b) - createdValue(a);
    }
  });

  return sorted;
}
