import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/ui";
import { parseSegments, splitHighlight } from "./intelligence.analysis";
import type { TranscriptSegment } from "./intelligence.types";

/** Sorgu eşleşmelerini <mark> ile vurgulayarak metni render eder. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => splitHighlight(text, query), [text, query]);
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            className="rounded bg-brand/20 text-ink px-0.5"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

/** Renkli konuşmacı rozeti — isimden deterministik renk üretir. */
const SPEAKER_TINTS = [
  "bg-brand/10 text-brand",
  "bg-emerald-500/10 text-emerald-600",
  "bg-amber-500/10 text-amber-600",
  "bg-violet-500/10 text-violet-600",
  "bg-rose-500/10 text-rose-600",
  "bg-cyan-500/10 text-cyan-600",
];

function speakerTint(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SPEAKER_TINTS[h % SPEAKER_TINTS.length];
}

function SegmentList({
  segments,
  query,
}: {
  segments: TranscriptSegment[];
  query: string;
}) {
  return (
    <div className="tl-stagger space-y-3">
      {segments.map((seg, i) => (
        <div key={i} className="flex gap-3">
          <span
            className={
              "shrink-0 h-7 px-2 inline-flex items-center rounded-full text-xs font-medium " +
              speakerTint(seg.speaker)
            }
          >
            {seg.speaker}
          </span>
          <div className="min-w-0 flex-1">
            {seg.timestamp && (
              <span className="text-xs text-muted tabular-nums mr-2">
                {seg.timestamp}
              </span>
            )}
            <span className="text-sm text-ink leading-relaxed whitespace-pre-wrap break-words">
              <Highlighted text={seg.text} query={query} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Salt-okunur transkript görüntüleyici: konuşmacı segmentleri varsa onları,
 * yoksa düz (vurgulanmış) metni gösterir.
 */
export function TranscriptViewer({
  content,
  query,
}: {
  content: string;
  query: string;
}) {
  const { t } = useTranslation("intelligence");
  const segments = useMemo(() => parseSegments(content), [content]);

  if (!content.trim()) {
    return (
      <EmptyState
        title={t("viewer.emptyContent")}
        description={t("viewer.contentPlaceholder")}
      />
    );
  }

  if (segments.length > 0) {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
          <Icon name="users" className="w-3.5 h-3.5" />
          {t("segments.title")}
        </div>
        <SegmentList segments={segments} query={query} />
      </div>
    );
  }

  return (
    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap break-words">
      <Highlighted text={content} query={query} />
    </p>
  );
}
