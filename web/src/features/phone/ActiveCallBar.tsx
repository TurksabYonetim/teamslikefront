import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineMicrophone,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineArrowsRightLeft,
  HiOutlinePhoneXMark,
  HiOutlinePhone,
  HiOutlinePhoneArrowDownLeft,
  HiOutlineStop,
  HiOutlineMusicalNote,
  HiOutlineSignal,
  HiOutlineUserGroup,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useToast } from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import { useCan } from "@/lib/authStore";
import { callStore, useCall } from "./callStore";
import { useCreateCallLog, useContacts } from "./phone.hooks";
import { formatNumber, classifyCaller, normalizeNumber } from "./routing";
import { monitorAudio } from "./pbx";
import { WrapUpCard } from "./WrapUpCard";
import { formatDuration } from "./phone.types";
import type { MonitorMode } from "./phone.types";

/** Otomatik yanıt gecikmesi (ms) — gerçek altyapı yokken giden çağrı "çalar" sonra bağlanır. */
const AUTO_ANSWER_MS = 2500;

const MONITOR_MODES: MonitorMode[] = ["listen", "whisper", "barge", "takeover"];

/** AppShell'e monte edilen global çağrı çubuğu. Aktif çağrı yoksa hiç render olmaz. */
export function ActiveCallBar() {
  const { t } = useTranslation("phone");
  const toast = useToast();
  const call = useCall((s) => s.activeCall);
  const muted = useCall((s) => s.muted);
  const peerName = useCall((s) => s.peerName);
  const pendingLog = useCall((s) => s.pendingLog);
  const pendingDisposition = useCall((s) => s.pendingDisposition);
  const blocklist = useCall((s) => s.blocklist);
  const parked = useCall((s) => s.parked);
  const consult = useCall((s) => s.consult);
  const holdMusic = useCall((s) => s.holdMusic);
  const monitor = useCall((s) => s.monitor);
  const canSupervise = useCan("admin.access");
  const { data: contacts } = useContacts();
  const createCallLog = useCreateCallLog();

  // Yerel UI: danışma giriş kutusu açık mı + hedef metni.
  const [consultOpen, setConsultOpen] = useState(false);
  const [consultTarget, setConsultTarget] = useState("");

  // Hibrit dikiş: sonlanan çağrıyı gerçek /v1/call-logs'a yaz.
  useEffect(() => {
    if (!pendingLog) return;
    createCallLog
      .mutateAsync(pendingLog)
      .catch((err) => toast.show({ message: apiErrorMessage(err), variant: "error" }))
      .finally(() => callStore.getState().clearPendingLog());
    // createCallLog/toast kararlı sayılır; yalnızca pendingLog değişiminde tetikle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingLog]);

  // Giden çağrı bir süre çaldıktan sonra otomatik yanıtlanır.
  useEffect(() => {
    if (call?.direction === "outbound" && call.state === "ringing") {
      const id = window.setTimeout(() => callStore.getState().answer(), AUTO_ANSWER_MS);
      return () => window.clearTimeout(id);
    }
  }, [call?.id, call?.state, call?.direction]);

  // Aktif çağrı süresini saniyede bir artır.
  useEffect(() => {
    if (call?.state !== "active") return;
    const id = window.setInterval(() => callStore.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, [call?.state]);

  // Aktif çağrı bittiğinde danışma kutusunu kapat.
  useEffect(() => {
    if (!call) {
      setConsultOpen(false);
      setConsultTarget("");
    }
  }, [call?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Park şeridi tek başına da görünür (aktif çağrı yokken parktan geri alma).
  if (!call) {
    if (pendingDisposition) return <WrapUpCard />;
    if (parked.length > 0) return <ParkedStrip />;
    return null;
  }

  const peer = call.direction === "outbound" ? call.to : call.from;
  const display = peerName || formatNumber(peer);
  const isIncomingRinging = call.direction === "inbound" && call.state === "ringing";
  const isOutgoingRinging = call.direction === "outbound" && call.state === "ringing";

  const startConsult = () => {
    const target = consultTarget.trim();
    if (!target) return;
    callStore.getState().startConsult(target);
    setConsultOpen(false);
    setConsultTarget("");
  };

  // Arayan baş harfleri (avatar varyantı için).
  const callerInitials =
    display
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s.charAt(0).toLocaleUpperCase("tr"))
      .join("") || "?";

  // Çağrı çubuğu gövdesi — arayan avatarı + çalma halkası ".call-bar .call-avatar"
  // üzerinden styles/index.css'te (impeccable delight).
  const renderBar = () => (
    <div
      role="region"
      aria-label={isIncomingRinging ? t("bar.incomingTitle") : t("bar.title")}
      className="call-bar fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
    >
      {parked.length > 0 && <ParkedStrip embedded />}

      {/* Süpervizör izleme paneli — admin korumalı, aktif izleme varken görünür */}
      {monitor && canSupervise && <MonitorPanel mode={monitor} />}

      {/* Danışma kutusu — aktif danışma varken kontrol şeridi */}
      {consult && <ConsultStrip target={consult.name || formatNumber(consult.peer)} />}

      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        {/* Arayan kimliği + durum */}
        <span
          aria-hidden
          className="call-avatar inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-softer text-sm font-semibold text-brand"
        >
          {callerInitials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="call-name truncate text-sm font-semibold text-ink">
            {display}
          </p>
          <p className="call-status text-xs text-muted" aria-live="polite">
            {isIncomingRinging
              ? t("bar.incomingTitle")
              : isOutgoingRinging
                ? t("outgoing.ringing", { number: formatNumber(peer) })
                : call.state === "hold"
                  ? t("bar.onHold")
                  : formatDuration(call.durationSec)}
          </p>
        </div>

        {/* Gelen çağrı: kabul / reddet */}
        {isIncomingRinging ? (
          <div className="flex items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted dark:bg-gray-700 dark:text-gray-300">
              {t(`enums.callerClass.${classifyCaller(normalizeNumber(peer), { contacts: (contacts ?? []).map((c) => ({ name: c.name, e164: normalizeNumber(c.number) })), blocklist })}`)}
            </span>
            <button
              type="button"
              onClick={() => callStore.getState().blockNumber(peer)}
              className="mr-1 text-xs font-medium text-red-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:text-red-400"
            >
              {t("bar.block")}
            </button>
            <button
              type="button"
              onClick={() => callStore.getState().answer()}
              className="call-accept inline-flex h-11 items-center gap-2 rounded-full bg-green-600 px-4 text-sm font-medium text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-green-700 motion-safe:active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              <HiOutlinePhone size={18} aria-hidden /> {t("bar.accept")}
            </button>
            <button
              type="button"
              onClick={() => callStore.getState().decline()}
              className="call-decline inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-red-700 motion-safe:active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <HiOutlinePhoneXMark size={18} aria-hidden /> {t("bar.decline")}
            </button>
          </div>
        ) : isOutgoingRinging ? (
          /* Giden çağrı çalıyor: iptal */
          <button
            type="button"
            onClick={() => callStore.getState().hangup()}
            aria-label={t("bar.cancel")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-red-700 motion-safe:active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <HiOutlinePhoneXMark size={20} aria-hidden />
          </button>
        ) : (
          /* Aktif / beklemede: tam kontrol seti */
          <div className="relative flex items-center gap-1.5">
            <BarButton
              label={muted ? t("bar.unmute") : t("bar.mute")}
              active={muted}
              onClick={() => callStore.getState().toggleMute()}
              Icon={HiOutlineMicrophone}
            />
            {call.state === "hold" ? (
              <BarButton
                label={t("bar.resume")}
                onClick={() => callStore.getState().resume()}
                Icon={HiOutlinePlay}
              />
            ) : (
              <BarButton
                label={t("bar.hold")}
                onClick={() => callStore.getState().hold()}
                Icon={HiOutlinePause}
              />
            )}
            <BarButton
              label={t("bar.holdMusic")}
              active={holdMusic}
              onClick={() => callStore.getState().toggleHoldMusic()}
              Icon={HiOutlineMusicalNote}
            />
            <BarButton
              label={call.recording ? t("bar.stopRecord") : t("bar.record")}
              active={!!call.recording}
              onClick={() => callStore.getState().toggleRecording()}
              Icon={call.recording ? HiOutlineStop : HiOutlinePhone}
            />
            <BarButton
              label={t("bar.park")}
              onClick={() => callStore.getState().park()}
              Icon={HiOutlinePhoneArrowDownLeft}
            />
            {/* Danışmalı transfer — popover */}
            <BarButton
              label={t("consult.start")}
              active={consultOpen || !!consult}
              onClick={() => setConsultOpen((v) => !v)}
              Icon={HiOutlineArrowsRightLeft}
            />
            {/* Süpervizör izleme — admin korumalı */}
            {canSupervise && (
              <BarButton
                label={monitor ? t("bar.stopMonitor") : t("bar.monitor")}
                active={!!monitor}
                onClick={() =>
                  monitor
                    ? callStore.getState().stopMonitor()
                    : callStore.getState().setMonitor("listen")
                }
                Icon={HiOutlineSignal}
              />
            )}
            <button
              type="button"
              onClick={() => callStore.getState().hangup()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-red-700 motion-safe:active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <HiOutlinePhoneXMark size={18} aria-hidden /> {t("bar.hangup")}
            </button>

            {/* Danışma hedefi girişi (origin-aware popover) */}
            {consultOpen && !consult && (
              <div
                role="dialog"
                aria-label={t("consult.title")}
                style={{ animation: "tl-pop-in var(--dur-pop) var(--ease-out)" }}
                className="absolute bottom-14 right-0 z-10 w-64 origin-bottom-right rounded-xl border border-line bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor="consult-target">
                  {t("consult.targetLabel")}
                </label>
                <input
                  id="consult-target"
                  type="text"
                  inputMode="tel"
                  autoFocus
                  value={consultTarget}
                  onChange={(e) => setConsultTarget(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startConsult();
                    if (e.key === "Escape") setConsultOpen(false);
                  }}
                  placeholder={t("consult.targetPlaceholder")}
                  className="input"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-transform duration-150 ease-[var(--ease-out)] hover:text-ink active:scale-95"
                  >
                    {t("bar.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={startConsult}
                    disabled={!consultTarget.trim()}
                    className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-brand/90 active:scale-95 disabled:opacity-50"
                  >
                    {t("consult.callTarget")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return renderBar();
}

/** Aktif danışma çağrısı şeridi: tamamla / birleştir / iptal. */
function ConsultStrip({ target }: { target: string }) {
  const { t } = useTranslation("phone");
  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2">
        <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
          <HiOutlineArrowsRightLeft size={16} aria-hidden />
          <span className="truncate">{t("consult.consulting", { target })}</span>
        </span>
        <button
          type="button"
          onClick={() => callStore.getState().completeTransfer()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-green-700 active:scale-95"
        >
          {t("consult.complete")}
        </button>
        <button
          type="button"
          onClick={() => callStore.getState().mergeConsult()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 transition-transform duration-150 ease-[var(--ease-out)] hover:bg-amber-100 active:scale-95 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
        >
          <HiOutlineUserGroup size={14} aria-hidden /> {t("consult.merge")}
        </button>
        <button
          type="button"
          onClick={() => callStore.getState().cancelConsult()}
          aria-label={t("consult.cancel")}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-amber-700 transition-transform duration-150 ease-[var(--ease-out)] hover:bg-amber-100 active:scale-95 dark:text-amber-300 dark:hover:bg-amber-900/40"
        >
          <HiOutlineXMark size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Süpervizör izleme paneli: mod seçimi + ses yönü göstergesi. Admin korumalı. */
function MonitorPanel({ mode }: { mode: MonitorMode }) {
  const { t } = useTranslation("phone");
  const audio = monitorAudio(mode);
  const flows: { key: keyof typeof audio; label: string }[] = [
    { key: "supervisorHearsParties", label: t("monitor.supervisorHears") },
    { key: "agentHearsSupervisor", label: t("monitor.agentHears") },
    { key: "customerHearsSupervisor", label: t("monitor.customerHears") },
  ];
  return (
    <div className="border-b border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/20">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-800 dark:text-indigo-200">
            <HiOutlineSignal size={16} aria-hidden /> {t("monitor.title")}
          </span>
          <div role="radiogroup" aria-label={t("monitor.title")} className="flex flex-wrap gap-1">
            {MONITOR_MODES.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={m === mode}
                onClick={() => callStore.getState().setMonitor(m)}
                className={
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-transform duration-150 ease-[var(--ease-out)] active:scale-95 " +
                  (m === mode
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-indigo-700 hover:bg-indigo-100 dark:bg-gray-800 dark:text-indigo-200 dark:hover:bg-indigo-900/40")
                }
              >
                {t(`monitor.${m}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => callStore.getState().stopMonitor()}
            className="ml-auto text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-300"
          >
            {t("monitor.stop")}
          </button>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-indigo-700 dark:text-indigo-300">
          {flows.map((f) => (
            <li key={f.key} className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className={
                  "inline-block h-2 w-2 rounded-full " +
                  (audio[f.key] ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600")
                }
              />
              <span className={audio[f.key] ? "" : "text-muted line-through"}>
                {f.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Park edilmiş çağrılar şeridi: her parklı çağrıyı pickup ile geri al. */
function ParkedStrip({ embedded }: { embedded?: boolean }) {
  const { t } = useTranslation("phone");
  const parked = useCall((s) => s.parked);
  const hasActive = useCall((s) => s.activeCall !== null);
  if (parked.length === 0) return null;

  const inner = (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
        <HiOutlinePhoneArrowDownLeft size={14} aria-hidden />
        {t("parked.title")} ({parked.length})
      </span>
      <ul className="tl-stagger flex flex-wrap items-center gap-2">
        {parked.map((c) => {
          const peer = c.direction === "outbound" ? c.to : c.from;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => callStore.getState().pickup(c.id)}
                disabled={hasActive}
                aria-label={`${t("parked.pickup")} — ${formatNumber(peer)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink transition-transform duration-150 ease-[var(--ease-out)] hover:border-brand hover:text-brand active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <HiOutlinePhone size={13} aria-hidden />
                {formatNumber(peer)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (embedded) {
    return <div className="border-b border-line bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">{inner}</div>;
  }
  return (
    <div
      role="region"
      aria-label={t("parked.title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-gray-50 shadow-2xl dark:border-gray-700 dark:bg-gray-800/95"
    >
      {inner}
    </div>
  );
}

interface BarButtonProps {
  label: string;
  onClick: () => void;
  Icon: typeof HiOutlineMicrophone;
  active?: boolean;
}

function BarButton({ label, onClick, Icon, active }: BarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={
        "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-[transform,color,background-color,border-color] duration-150 ease-[var(--ease-out)] motion-safe:active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand " +
        (active
          ? "border-brand bg-brand/10 text-brand"
          : "border-line text-muted hover:text-ink dark:border-gray-700")
      }
    >
      <Icon size={20} aria-hidden />
    </button>
  );
}
