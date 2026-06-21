import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass, HiOutlineSpeakerWave } from "react-icons/hi2";
import { useIntel, intelStore } from "../intel.store";
import { SOURCES, LANGS } from "../intel.data";
import { segmentText } from "../intel.segments";
import type { TranscriptSegment } from "../intel.types";
import { memberName } from "@/features/messaging/members";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui";
import { fmtClock } from "./SentimentChip";

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Mask emails and long digit runs (PII redaction / compliance). */
function redactText(text: string) {
  return text.replace(/[\w.+-]+@[\w.-]+\.\w+/g, "•••@•••").replace(/\b\d{4,}\b/g, "••••");
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-amber-400 px-0.5 text-gray-900">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

// AAA duygu rozeti: tinted zemin üzerine koyu metin (text-800 / 100-bg → ≥7:1).
// Anlam renkle değil kelimeyle taşınır (1.4.1); nokta yalnız dekoratif.
const SENT_PILL: Record<string, string> = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  neutral: "bg-surface-3 text-ink-2 dark:bg-gray-700 dark:text-gray-200",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export function TranscriptViewer() {
  const { t } = useTranslation("intelligence");
  const segments = useIntel((s) => s.segments);
  const targetLang = useIntel((s) => s.targetLang);
  const search = useIntel((s) => s.search);
  const speakerFilter = useIntel((s) => s.speakerFilter);
  const dub = useIntel((s) => s.dub);
  const redact = useIntel((s) => s.redact);
  const activeSourceId = useIntel((s) => s.activeSourceId);
  const endRef = React.useRef<HTMLDivElement>(null);

  const source = SOURCES.find((s) => s.id === activeSourceId);
  const dubLang = LANGS.find((l) => l.code === targetLang)?.label ?? targetLang;

  const speakers = Array.from(new Set(segments.map((s) => s.speakerId)));
  const q = search.trim().toLowerCase();
  const filtered = segments
    .filter((s) => !speakerFilter || s.speakerId === speakerFilter)
    .filter(
      (s) =>
        q === "" ||
        s.en.toLowerCase().includes(q) ||
        s.tr.toLowerCase().includes(q) ||
        Object.values(s.translations ?? {}).some((v) => v.toLowerCase().includes(q)),
    );

  React.useEffect(() => {
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "end" });
  }, [segments.length]);

  const translate = (seg: TranscriptSegment) => segmentText(seg, targetLang);

  return (
    <div className="flex h-full flex-col rounded-card border border-line bg-surface-2 dark:border-gray-700 dark:bg-gray-800">
      {/* Header — mobile-first: dikey yığın, sm+ satır. 44px hedefler, AAA. */}
      <div className="flex flex-col gap-2 border-b border-line px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center dark:border-gray-700">
        <span className="text-base font-semibold text-ink dark:text-white">{t("transcript")}</span>
        <span className="w-fit rounded-sm border border-line px-1.5 py-0.5 text-xs font-medium text-ink-3 dark:border-gray-700 dark:text-gray-300">
          {t("detected")}: {source?.language?.toUpperCase() ?? "EN"}
        </span>
        <div className="relative w-full sm:ml-auto sm:w-44">
          <HiOutlineMagnifyingGlass
            aria-hidden
            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => intelStore.getState().setSearch(e.target.value)}
            placeholder={t("searchTranscript")}
            aria-label={t("searchTranscript")}
            className="input h-11 w-full pl-8"
          />
        </div>
        <Select
          value={speakerFilter ?? ""}
          onChange={(v) => intelStore.getState().setSpeakerFilter(v || null)}
          aria-label={t("speakerFilter")}
          options={[
            { value: "", label: t("allSpeakers") },
            ...speakers.map((sp) => {
              const seg = segments.find((s) => s.speakerId === sp);
              return { value: sp, label: seg?.speakerName ?? memberName(sp) };
            }),
          ]}
          className="w-full sm:w-44"
        />
      </div>

      {dub ? (
        <div
          className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-1.5 text-sm text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300"
          aria-live="polite"
        >
          <HiOutlineSpeakerWave className="h-4 w-4" aria-hidden /> {t("dubbing", { lang: dubLang })}
        </div>
      ) : null}

      <div
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4"
        role="log"
        aria-live="polite"
        aria-label={t("transcript")}
      >
        {filtered.length === 0 ? (
          <p className="text-sm text-muted dark:text-gray-400">{t("noMatches")}</p>
        ) : (
          filtered.map((seg) => {
            const name = seg.speakerName ?? memberName(seg.speakerId);
            return (
              <article
                key={seg.id}
                id={`seg-${seg.id}`}
                aria-label={`${name}, ${fmtClock(seg.startSec)}, ${t(`sentiment.${seg.sentiment}`)}`}
                className="tr-seg -mx-2 flex gap-3 rounded-md px-2 py-1.5"
              >
                <Avatar name={name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink dark:text-white">{name}</span>
                    <span className="text-sm text-muted tabular-nums dark:text-gray-400">{fmtClock(seg.startSec)}</span>
                    <span
                      className={"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium " + SENT_PILL[seg.sentiment]}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
                      {t(`sentiment.${seg.sentiment}`)}
                    </span>
                  </div>
                  <div className="break-words text-sm text-ink dark:text-white">
                    {highlight(redact ? redactText(seg.en) : seg.en, search.trim())}
                  </div>
                  {targetLang !== "off" ? (
                    <div className="mt-0.5 break-words rounded-md border border-line bg-surface-2 px-2 py-1 text-sm text-ink dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      {redact ? redactText(translate(seg)) : translate(seg)}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
