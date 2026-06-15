/**
 * Intelligence — AI copilot yardımcıları (saf mantık).
 *
 * Üst çubuktaki "AI Özetle" / "AI Eylem Maddeleri" butonları gerçek bir
 * copilot çağrısı yerine (backend yok) bu deterministik kurguyu kullanır:
 * mevcut kaynağın yapılandırılmış recap'inden bir özet metni ve eylem maddesi
 * listesi türetir. Backend geldiğinde yalnızca `runIntelCopilot` gövdesi
 * gerçek bir `POST /copilot` çağrısıyla değiştirilir; çağıranlar değişmez.
 */
import type { Recap } from "./intel.types";

export type IntelCopilotKind = "summarize" | "actions";

export interface IntelCopilotResult {
  kind: IntelCopilotKind;
  /** Tek satırlık başlık (toast'ta gösterilir). */
  headline: string;
  /** Yapılandırılmış gövde satırları (özet/eylem maddeleri). */
  lines: string[];
}

/**
 * Bir recap'ten yapılandırılmış copilot çıktısı üretir.
 * `summarize` → TLDR + kararlar; `actions` → eylem maddeleri.
 * Recap yoksa boş `lines` döner (çağıran "veri yok" durumunu ele alır).
 */
export function runIntelCopilot(
  kind: IntelCopilotKind,
  recap: Recap | undefined,
): IntelCopilotResult {
  if (!recap) {
    return { kind, headline: "", lines: [] };
  }
  if (kind === "summarize") {
    const lines = [recap.tldr, ...recap.decisions].filter(
      (l): l is string => typeof l === "string" && l.trim().length > 0,
    );
    return { kind, headline: recap.tldr, lines };
  }
  // kind === "actions"
  const lines = recap.actions
    .map((a) => a.text)
    .filter((t) => t.trim().length > 0);
  return { kind, headline: lines[0] ?? "", lines };
}
