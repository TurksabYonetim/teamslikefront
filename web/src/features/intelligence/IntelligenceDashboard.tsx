import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import {
  HiOutlineSignal,
  HiOutlineLockClosed,
  HiOutlineSpeakerWave,
  HiOutlineEyeSlash,
  HiOutlineSparkles,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowDownTray,
  HiOutlineQuestionMarkCircle,
  HiOutlineSquares2X2,
  HiOutlineLanguage,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import { useIntel, intelStore } from "./intel.store";
import { SOURCES, LANGS, RECAPS } from "./intel.data";
import { subscribeIntel } from "./intel.stream";
import { runIntelCopilot, type IntelCopilotKind } from "./intel.ai";
import { coachingToastVariant, newCoachingCues } from "./intel.coaching";
import type { CoachingCue } from "./intel.types";
import { TranscriptViewer } from "./components/TranscriptViewer";
import { TranslationSessionPanel } from "./components/TranslationSessionPanel";
import { Scorecard } from "./components/Scorecard";
import { RubricCard } from "./components/RubricCard";
import { SpeakerAnalytics } from "./components/SpeakerAnalytics";
import { SentimentTimeline } from "./components/SentimentTimeline";
import { IntentList } from "./components/IntentList";
import { TrackersCard } from "./components/TrackersCard";
import { HighlightReel } from "./components/HighlightReel";
import { CoachingPanel } from "./components/CoachingPanel";
import { RecapPanel } from "./components/RecapPanel";
import { MeetingNotesCard } from "./components/MeetingNotesCard";
import { IntelKpis } from "./components/IntelKpis";
import { ProductTour, Forbidden, type TourStep } from "@/components/ui";
import { useOnce } from "@/lib/useOnce";
import { useCan } from "@/lib/authStore";
import { ToastContext } from "@/components/ui/Toast";

type Tab = "overview" | "transcript" | "analytics" | "coaching";

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium",
        active
          ? "border-brand text-brand"
          : "border-transparent text-muted hover:border-gray-300 hover:text-ink dark:text-gray-400 dark:hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function IntelligenceDashboard() {
  const { t } = useTranslation("intelligence");
  const activeSourceId = useIntel((s) => s.activeSourceId);
  const targetLang = useIntel((s) => s.targetLang);
  const live = useIntel((s) => s.live);
  const dub = useIntel((s) => s.dub);
  const redact = useIntel((s) => s.redact);
  const coaching = useIntel((s) => s.coaching);
  const toast = React.useContext(ToastContext);
  const canView = useCan("intelligence.view");
  const canCoach = useCan("admin.access");
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = React.useState<Tab>("overview");

  // Onboarding tur: ilk girişte otomatik açılır, "?" ile tekrar açılır.
  const [seen, markSeen] = useOnce("intelligence");
  const [tourOpen, setTourOpen] = React.useState(false);
  React.useEffect(() => {
    if (!seen) setTourOpen(true);
  }, [seen]);
  const finishTour = () => {
    setTourOpen(false);
    markSeen();
  };

  const TOUR_STEPS: TourStep[] = [
    { title: t("tour.welcomeTitle"), body: t("tour.welcomeBody") },
    { targetId: "intel-source", title: t("tour.sourceTitle"), body: t("tour.sourceBody") },
    { targetId: "intel-kpis", title: t("tour.kpiTitle"), body: t("tour.kpiBody") },
    { targetId: "intel-tabs", title: t("tour.tabsTitle"), body: t("tour.tabsBody") },
    { targetId: "intel-live", title: t("tour.liveTitle"), body: t("tour.liveBody") },
    {
      targetId: "intel-transcript",
      tab: "transcript",
      title: t("tour.transcriptTitle"),
      body: t("tour.transcriptBody"),
    },
    { targetId: "intel-recap", tab: "overview", title: t("tour.recapTitle"), body: t("tour.recapBody") },
    { title: t("tour.doneTitle"), body: t("tour.doneBody") },
  ];

  // Skip the OUT sync on the initial render so an inbound ?source= deep-link
  // (handled by the IN effect) isn't clobbered on mount.
  const mountedRef = React.useRef(false);

  // Deep-link IN: ?source= (valid id, different) → setSource.
  React.useEffect(() => {
    const q = params.get("source");
    if (q && q !== activeSourceId && SOURCES.some((s) => s.id === q)) {
      intelStore.getState().setSource(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Deep-link OUT: a LOCAL activeSourceId change → write ?source= (replace).
  // Skipped on mount (mountedRef) so an inbound deep-link wins. When an inbound
  // deep-link drives the change, `params` already names the new source by the
  // time this fires (q === activeSourceId → no write, no loop).
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const q = params.get("source");
    if (q !== activeSourceId) {
      const next = new URLSearchParams(params);
      next.set("source", activeSourceId);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSourceId]);

  const exportRecap = () => {
    const recap = RECAPS[activeSourceId];
    if (!recap) return;
    const lines = [
      `# ${t("recap")}`,
      "",
      recap.tldr,
      "",
      ...(recap.decisions.length
        ? [`## ${t("decisions")}`, ...recap.decisions.map((d) => `- ${d}`), ""]
        : []),
      ...(recap.actions.length
        ? [`## ${t("actionItems")}`, ...recap.actions.map((a) => `- [ ] ${a.text}`), ""]
        : []),
      ...(recap.nextSteps.length
        ? [`## ${t("nextSteps")}`, ...recap.nextSteps.map((n) => `- ${n}`), ""]
        : []),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSourceId}-recap.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.show({ message: t("exported"), variant: "success" });
  };

  // AI copilot: "Summarize" / "Action items" run a real (stubbed) copilot pass
  // over the active source's structured recap and surface a configured result.
  const runCopilot = (kind: IntelCopilotKind) => {
    const result = runIntelCopilot(kind, RECAPS[activeSourceId]);
    if (result.lines.length === 0) {
      toast?.show({ message: t("ai.noData"), variant: "error" });
      return;
    }
    const message =
      kind === "summarize"
        ? t("ai.summarizeHeadline", { text: result.headline })
        : t("ai.actionsHeadline", {
            count: result.lines.length,
            text: result.headline,
          });
    toast?.show({ message, variant: "success" });
  };

  // Live SSE stream: one feed item's event group per tick → applyEvent.
  React.useEffect(() => {
    if (!live) return;
    const unsubscribe = subscribeIntel(
      activeSourceId,
      (e) => intelStore.getState().applyEvent(e),
      { intervalMs: 2600, onComplete: () => intelStore.setState({ live: false }) },
    );
    return unsubscribe;
  }, [live, activeSourceId]);

  // Live coaching whisper: while live, a manager (admin.access) gets a toast
  // for each NEW coaching cue. Tone follows the cue kind (warning → danger).
  const prevCoachingRef = React.useRef<CoachingCue[]>(coaching);
  React.useEffect(() => {
    const prev = prevCoachingRef.current;
    prevCoachingRef.current = coaching;
    if (!live || !canCoach) return;
    for (const cue of newCoachingCues(prev, coaching)) {
      toast?.show({
        message: t("coachingTriggered", { text: cue.text }),
        variant: coachingToastVariant(cue.kind),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coaching, live, canCoach]);

  // Permission guard: no intelligence.view → forbidden screen.
  if (!canView) return <Forbidden />;

  return (
    <div data-testid="intel-dashboard" className="flex h-[calc(100vh-8rem)] flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white">{t("dash.title")}</h1>
          <p className="text-sm text-muted dark:text-gray-400">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div id="intel-source">
            <label className="flex items-center gap-1.5 text-sm text-muted dark:text-gray-400">
              {t("source")}
              <select
                value={activeSourceId}
                onChange={(e) => intelStore.getState().setSource(e.target.value)}
                aria-label={t("source")}
                className="h-9 rounded-md border border-line bg-surface-3 px-2 text-sm text-ink dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              >
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} · {t(`kindLabel.${s.kind}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => runCopilot("summarize")}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-sm text-ink transition-transform hover:bg-surface-3 active:scale-[0.97] dark:border-gray-700 dark:text-white"
          >
            <HiOutlineSparkles className="h-4 w-4" aria-hidden /> {t("summarize")}
          </button>
          <button
            type="button"
            onClick={() => runCopilot("actions")}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-sm text-ink transition-transform hover:bg-surface-3 active:scale-[0.97] dark:border-gray-700 dark:text-white"
          >
            <HiOutlineClipboardDocumentCheck className="h-4 w-4" aria-hidden /> {t("actionItems")}
          </button>
          <button
            type="button"
            onClick={exportRecap}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-3 text-sm text-ink hover:bg-surface-3 dark:border-gray-700 dark:text-white"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" aria-hidden /> {t("export")}
          </button>

          <button
            id="intel-live"
            type="button"
            onClick={() => intelStore.getState().toggleLive()}
            aria-pressed={live}
            className={clsx(
              "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm",
              live
                ? "bg-red-600 text-white"
                : "bg-surface-2 text-ink dark:bg-gray-700 dark:text-white",
            )}
          >
            <HiOutlineSignal className="h-4 w-4" aria-hidden /> {live ? t("liveOn") : t("goLive")}
          </button>

          <button
            id="intel-help"
            type="button"
            onClick={() => setTourOpen(true)}
            aria-label={t("tour.replay")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted hover:bg-surface-3 dark:border-gray-700 dark:text-gray-400"
          >
            <HiOutlineQuestionMarkCircle className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* KPI row */}
      <IntelKpis />

      {/* Tabs */}
      <div id="intel-tabs" className="border-b border-line dark:border-gray-700">
        <div role="tablist" className="-mb-px flex flex-wrap gap-1">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
            <HiOutlineSquares2X2 className="h-4 w-4" aria-hidden /> {t("tabs.overview")}
          </TabBtn>
          <TabBtn active={tab === "transcript"} onClick={() => setTab("transcript")}>
            <HiOutlineLanguage className="h-4 w-4" aria-hidden /> {t("tabs.transcript")}
          </TabBtn>
          <TabBtn active={tab === "analytics"} onClick={() => setTab("analytics")}>
            <HiOutlineChartBar className="h-4 w-4" aria-hidden /> {t("tabs.analytics")}
          </TabBtn>
          <TabBtn active={tab === "coaching"} onClick={() => setTab("coaching")}>
            <HiOutlineAcademicCap className="h-4 w-4" aria-hidden /> {t("tabs.coaching")}
          </TabBtn>
        </div>
      </div>

      {/* Tab panels */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "overview" ? (
          <div className="flex flex-col gap-4">
            <div id="intel-recap" className="grid gap-4 lg:grid-cols-2">
              <RecapPanel />
              <HighlightReel />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <SentimentTimeline />
              <IntentList />
            </div>
          </div>
        ) : null}

        {tab === "transcript" ? (
          <div className="grid h-full min-h-0 gap-3 lg:grid-cols-3">
            {/* Transcript — spans two of three columns on lg. */}
            <div
              id="intel-transcript"
              className="flex min-h-0 flex-col lg:col-span-2"
            >
              <TranscriptViewer />
            </div>

            {/* Translation controls + session panel — single side column on lg. */}
            <div className="flex min-h-0 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
                <label className="flex items-center gap-1.5 text-sm text-muted dark:text-gray-400">
                  {t("translateTo")}
                  <select
                    value={targetLang}
                    onChange={(e) => intelStore.getState().setTargetLang(e.target.value)}
                    aria-label={t("translateTo")}
                    className="h-9 rounded-md border border-line bg-surface-3 px-2 text-sm text-ink dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  >
                    {LANGS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.code === "off" ? t("translateOff") : l.label}
                      </option>
                    ))}
                  </select>
                </label>

                {targetLang !== "off" && targetLang !== "en" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    <HiOutlineLockClosed className="h-3.5 w-3.5" aria-hidden /> {t("voicePreserving")}
                  </span>
                ) : null}

                {targetLang !== "off" ? (
                  <button
                    type="button"
                    onClick={() => intelStore.getState().toggleDub()}
                    aria-pressed={dub}
                    className={clsx(
                      "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm transition-transform active:scale-[0.97]",
                      dub
                        ? "border-brand text-brand"
                        : "border-line text-muted hover:bg-surface-3 dark:border-gray-700 dark:text-gray-400",
                    )}
                  >
                    <HiOutlineSpeakerWave className="h-4 w-4" aria-hidden /> {t("listenInLang")}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => intelStore.getState().toggleRedact()}
                  aria-pressed={redact}
                  className={clsx(
                    "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm transition-transform active:scale-[0.97]",
                    redact
                      ? "border-brand text-brand"
                      : "border-line text-muted hover:bg-surface-3 dark:border-gray-700 dark:text-gray-400",
                  )}
                >
                  <HiOutlineEyeSlash className="h-4 w-4" aria-hidden /> {t("redact")}
                </button>
              </div>

              <TranslationSessionPanel />
            </div>
          </div>
        ) : null}

        {tab === "analytics" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Scorecard />
            <RubricCard />
            <SpeakerAnalytics />
            <TrackersCard />
            <MeetingNotesCard />
          </div>
        ) : null}

        {tab === "coaching" ? (
          <div className="flex flex-col gap-3">
            <CoachingPanel />
            <p className="text-sm text-muted dark:text-gray-400">{t("coachingEmpty")}</p>
          </div>
        ) : null}
      </div>

      <ProductTour
        open={tourOpen}
        steps={TOUR_STEPS}
        onFinish={finishTour}
        onStep={(s) => {
          if (s.tab) setTab(s.tab as Tab);
        }}
        labels={{
          back: t("tour.back"),
          next: t("tour.next"),
          skip: t("tour.skip"),
          finish: t("tour.finish"),
          step: t("tour.step"),
        }}
      />
    </div>
  );
}
