import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass, HiOutlineSpeakerWave } from "react-icons/hi2";
import { useIntel, intelStore } from "../intel.store";
import { SOURCES, LANGS } from "../intel.data";
import { segmentText } from "../intel.segments";
import type { TranscriptSegment } from "../intel.types";
import { memberName } from "@/features/messaging/members";
import { Avatar } from "@/components/ui/Avatar";
import { SentimentChip, fmtClock } from "./SentimentChip";

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
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2 dark:border-gray-700">
        <span className="text-base font-semibold text-ink dark:text-white">{t("transcript")}</span>
        <span className="rounded-sm border border-line px-1.5 text-sm text-muted dark:border-gray-700 dark:text-gray-400">
          {t("detected")}: {source?.language?.toUpperCase() ?? "EN"}
        </span>
        <div className="relative ml-auto">
          <HiOutlineMagnifyingGlass
            aria-hidden
            className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted dark:text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => intelStore.getState().setSearch(e.target.value)}
            placeholder={t("searchTranscript")}
            aria-label={t("searchTranscript")}
            className="h-9 w-40 rounded-md border border-line bg-surface-3 pl-7 pr-2 text-sm text-ink outline-none placeholder:text-muted dark:border-gray-700 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={speakerFilter ?? ""}
          onChange={(e) => intelStore.getState().setSpeakerFilter(e.target.value || null)}
          aria-label={t("speakerFilter")}
          className="h-9 rounded-md border border-line bg-surface-3 px-2 text-sm text-ink dark:border-gray-700 dark:bg-gray-700 dark:text-white"
        >
          <option value="">{t("allSpeakers")}</option>
          {speakers.map((sp) => {
            const seg = segments.find((s) => s.speakerId === sp);
            return (
              <option key={sp} value={sp}>
                {seg?.speakerName ?? memberName(sp)}
              </option>
            );
          })}
        </select>
      </div>

      {dub ? (
        <div
          className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-1.5 text-sm text-brand dark:border-gray-700 dark:bg-gray-800"
          aria-live="polite"
        >
          <HiOutlineSpeakerWave className="h-4 w-4" aria-hidden /> {t("dubbing", { lang: dubLang })}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted dark:text-gray-400">{t("noMatches")}</p>
        ) : (
          filtered.map((seg) => (
            <div key={seg.id} id={`seg-${seg.id}`} className="flex gap-3">
              <Avatar name={seg.speakerName ?? memberName(seg.speakerId)} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink dark:text-white">
                    {seg.speakerName ?? memberName(seg.speakerId)}
                  </span>
                  <span className="text-sm text-muted dark:text-gray-400">{fmtClock(seg.startSec)}</span>
                  <SentimentChip sentiment={seg.sentiment} />
                </div>
                <div className="text-sm text-ink dark:text-white">
                  {highlight(redact ? redactText(seg.en) : seg.en, search.trim())}
                </div>
                {targetLang !== "off" ? (
                  <div className="mt-0.5 rounded-md border border-line bg-surface-2 px-2 py-1 text-sm text-ink dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {redact ? redactText(translate(seg)) : translate(seg)}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
