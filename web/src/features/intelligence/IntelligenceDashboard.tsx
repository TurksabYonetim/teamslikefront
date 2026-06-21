import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import {
  HiOutlineSignal,
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
import { ProductTour, Forbidden, Select, type TourStep } from "@/components/ui";
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
        "inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:transition-transform motion-safe:active:scale-[0.97]",
        active
          ? "border-brand text-brand"
          : "border-transparent text-muted hover:border-line hover:text-ink dark:text-gray-400 dark:hover:text-white",
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
    <div
      data-testid="intel-dashboard"
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 lg:overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink dark:text-white">{t("dash.title")}</h1>
          <p className="text-sm text-muted dark:text-gray-400">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div id="intel-source" className="flex items-center gap-1.5 text-sm text-muted dark:text-gray-400">
            <span>{t("source")}</span>
            <Select
              value={activeSourceId}
              onChange={(v) => intelStore.getState().setSource(v)}
              aria-label={t("source")}
              options={SOURCES.map((s) => ({
                value: s.id,
                label: `${s.title} · ${t(`kindLabel.${s.kind}`)}`,
              }))}
              size="sm"
              className="w-56 max-w-[calc(100vw-7rem)]"
            />
          </div>

          {/* İkincil aksiyonlar — ikon-only 44px (erişilebilir ad: aria-label + title). */}
          {[
            { Icon: HiOutlineSparkles, label: t("summarize"), onClick: () => runCopilot("summarize") },
            { Icon: HiOutlineClipboardDocumentCheck, label: t("actionItems"), onClick: () => runCopilot("actions") },
            { Icon: HiOutlineArrowDownTray, label: t("export"), onClick: exportRecap },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={b.onClick}
              aria-label={b.label}
              title={b.label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-ink hover:bg-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-safe:transition-[transform,background-color] motion-safe:duration-[var(--dur-press)] motion-safe:ease-[var(--ease-out)] motion-safe:active:scale-[0.97] dark:border-gray-700 dark:text-white"
            >
              <b.Icon className="h-5 w-5" aria-hidden />
            </button>
          ))}

          {/* Birincil CTA — canlı durum vurgulu (AAA: red-800/red-100 veya blue-800 metin). */}
          <button
            id="intel-live"
            type="button"
            onClick={() => intelStore.getState().toggleLive()}
            aria-pressed={live}
            className={clsx(
              "inline-flex h-11 items-center gap-1.5 rounded-md px-4 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-safe:transition-[transform,background-color] motion-safe:duration-[var(--dur-press)] motion-safe:ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
              live
                ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                : "border border-blue-800 text-blue-800 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300",
            )}
          >
            {live ? (
              <span className="il-rec h-2.5 w-2.5 rounded-full bg-red-600 dark:bg-red-400" aria-hidden />
            ) : (
              <HiOutlineSignal className="h-4 w-4" aria-hidden />
            )}
            {live ? t("liveOn") : t("goLive")}
          </button>

          <button
            id="intel-help"
            type="button"
            onClick={() => setTourOpen(true)}
            aria-label={t("tour.replay")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-muted hover:bg-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-safe:transition-transform motion-safe:active:scale-[0.97] dark:border-gray-700 dark:text-gray-400"
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

      {/* Tab panels — lg+: sabit-yükseklik iç kaydırma; altında sayfa doğal kayar. */}
      <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
        {tab === "overview" ? (
          <div id="intel-recap" className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:h-full lg:min-h-0">
            {/* Recap (özet + kararlar + aksiyon maddeleri) — tam yükseklik, kolon-içi kaydırma */}
            <div className="flex min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto">
              <RecapPanel />
            </div>
            {/* Önemli anlar */}
            <div className="flex min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto">
              <HighlightReel />
            </div>
            {/* Duygu zaman çizelgesi + niyetler */}
            <div className="flex min-w-0 flex-col gap-5 lg:min-h-0 lg:overflow-y-auto">
              <SentimentTimeline />
              <IntentList />
            </div>
          </div>
        ) : null}

        {tab === "transcript" ? (
          <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-cols-3">
            {/* Transcript — spans two of three columns on lg. */}
            <div
              id="intel-transcript"
              className="flex min-w-0 flex-col lg:col-span-2 lg:min-h-0"
            >
              <TranscriptViewer />
            </div>

            {/* Translation controls + session panel — single side column on lg. */}
            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">

              <div className="rounded-card border border-line bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-ink dark:text-white">{t("translateTo")}</span>
                    <Select
                      value={targetLang}
                      onChange={(v) => intelStore.getState().setTargetLang(v)}
                      aria-label={t("translateTo")}
                      options={LANGS.map((l) => ({
                        value: l.code,
                        label: l.code === "off" ? t("translateOff") : l.label,
                      }))}
                      className="w-full sm:w-48"
                    />
                  </div>

                  {targetLang !== "off" ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dub}
                      aria-label={t("listenInLang")}
                      onClick={() => intelStore.getState().toggleDub()}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-md px-1 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-white">
                        <HiOutlineSpeakerWave className="h-4 w-4 text-muted dark:text-gray-400" aria-hidden />
                        {t("listenInLang")}
                      </span>
                      <span className="tc-switch relative h-6 w-11 shrink-0 rounded-full bg-line dark:bg-gray-600" data-on={dub}>
                        <span className="tc-thumb absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                      </span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    role="switch"
                    aria-checked={redact}
                    aria-label={t("redact")}
                    onClick={() => intelStore.getState().toggleRedact()}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md px-1 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span className="flex flex-col">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-white">
                        <HiOutlineEyeSlash className="h-4 w-4 text-muted dark:text-gray-400" aria-hidden />
                        {t("redact")}
                      </span>
                      <span className="text-xs text-muted dark:text-gray-400">{t("voicePreserving")}</span>
                    </span>
                    <span className="tc-switch relative h-6 w-11 shrink-0 rounded-full bg-line dark:bg-gray-600" data-on={redact}>
                      <span className="tc-thumb absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </span>
                  </button>
                </div>
              </div>


              <TranslationSessionPanel />
            </div>
          </div>
        ) : null}

        {tab === "analytics" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Scorecard />
            <RubricCard />
            <SpeakerAnalytics />
            <TrackersCard />
            <div className="md:col-span-2 xl:col-span-3">
              <MeetingNotesCard />
            </div>
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
