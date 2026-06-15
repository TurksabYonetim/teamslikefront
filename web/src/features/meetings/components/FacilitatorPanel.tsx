import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineClipboardDocumentCheck,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineBookmark,
} from "react-icons/hi2";
import { useMeeting } from "../meetings.store";
import {
  buildAgenda,
  agendaProgress,
  agendaTotal,
  extractActionItems,
  meetingChapters,
} from "../facilitator";
import { Badge, IconButton } from "@/components/ui";

/** AI Facilitator (Teams parity): timed agenda, timekeeper, action-item mining. */
export function FacilitatorPanel() {
  const { t } = useTranslation("meetings");
  const captions = useMeeting((s) => s.captions);
  const [elapsedMin, setElapsedMin] = React.useState(0);

  const agenda = buildAgenda([
    { title: t("facilitator.items.intro"), minutes: 5 },
    { title: t("facilitator.items.demo"), minutes: 15 },
    { title: t("facilitator.items.qa"), minutes: 10 },
  ]);
  const total = agendaTotal(agenda);
  const prog = agendaProgress(agenda, elapsedMin);
  const lines = captions.map((c) => ({ speaker: c.speaker, text: c.text }));
  const actions = extractActionItems(lines);
  const chapters = meetingChapters(lines);

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ink">
        <HiOutlineSparkles className="h-4 w-4" aria-hidden /> {t("facilitator.title")}
      </h3>

      <div className="rounded-md border border-line px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <HiOutlineClock className="h-4 w-4 text-muted" aria-hidden />
          <span className="flex-1 text-ink">
            {prog.current ? prog.current.title : t("facilitator.noAgenda")}
          </span>
          <IconButton label={t("facilitator.back")} onClick={() => setElapsedMin((m) => Math.max(0, m - 5))}>
            <HiOutlineMinus className="h-4 w-4" aria-hidden />
          </IconButton>
          <span className="tabular-nums text-muted" aria-live="polite">
            {elapsedMin}/{total} {t("facilitator.min")}
          </span>
          <IconButton label={t("facilitator.fwd")} onClick={() => setElapsedMin((m) => m + 5)}>
            <HiOutlinePlus className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
        {prog.done ? (
          <Badge tone={prog.overrunMin > 0 ? "warning" : "positive"}>
            {prog.overrunMin > 0
              ? t("facilitator.overrun", { n: prog.overrunMin })
              : t("facilitator.onTime")}
          </Badge>
        ) : null}
      </div>

      <div className="rounded-md border border-line px-3 py-2">
        <div className="mb-1 flex items-center gap-1 text-sm text-muted">
          <HiOutlineClipboardDocumentCheck className="h-4 w-4" aria-hidden />{" "}
          {t("facilitator.actionItems", { n: actions.length })}
        </div>
        {actions.length === 0 ? (
          <p className="text-sm text-muted">{t("facilitator.noActions")}</p>
        ) : (
          <ul className="space-y-1">
            {actions.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink">
                <Badge tone="accent">{a.owner}</Badge>
                <span className="min-w-0 flex-1 truncate">{a.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-line px-3 py-2">
        <div className="mb-1 flex items-center gap-1 text-sm text-muted">
          <HiOutlineBookmark className="h-4 w-4" aria-hidden />{" "}
          {t("facilitator.chapters", { n: chapters.length })}
        </div>
        {chapters.length === 0 ? (
          <p className="text-sm text-muted">{t("facilitator.noChapters")}</p>
        ) : (
          <ol className="space-y-1">
            {chapters.map((c) => (
              <li key={c.index} className="flex items-center gap-2 text-sm text-ink">
                <span className="tabular-nums text-muted">{c.index + 1}.</span>
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
