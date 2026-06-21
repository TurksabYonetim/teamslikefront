import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInitFlowbite } from "@/lib/flowbite";
import { useLocalCrud } from "@/lib/useLocalCrud";
import {
  startJitsiMeeting,
  decodeJitsiModerator,
  JITSI_REACTIONS,
  JITSI_BACKGROUNDS,
  type JitsiApi,
  type JitsiParticipant,
} from "@/lib/jitsi";
import { meetingShareUrl } from "@/lib/meetingLink";
import { useMeetings } from "./meetings.hooks";
import type { MeetingRating } from "./meetings.types";

/** Sohbet panelindeki tek mesaj. */
interface ChatMessage {
  id: string;
  nick: string;
  text: string;
  /** ms epoch */
  ts: number;
  mine: boolean;
}

/** saniye cinsinden geçen süreyi HH:MM:SS / MM:SS biçimine çevirir. */
function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
}

/** ms epoch → HH:MM (yerel saat). */
function formatClock(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** baş harfi avatarı için displayName'den 1-2 harf çıkar. */
function initials(name?: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** /room'a iletilebilen yönlendirme durumu (navigate(..., { state })). */
interface RoomLocationState {
  joinUrl?: string;
  displayName?: string;
  email?: string;
  meetingId?: string;
  isModerator?: boolean;
}

/**
 * Flowbite "meeting-room.html" sayfasından çevrildi; ana video sahnesi
 * gerçek Jitsi gömme alanına dönüştürüldü. Çevre UI (kontroller, katılımcı
 * listesi) statik kalır.
 *
 * join_url çözüm sırası:
 *   1) react-router location.state.joinUrl
 *   2) ?join=<encoded url> query param
 *   3) ?meetingId=<id> ile useMeetings'ten ilgili meeting.join_url
 */
export function MeetingRoomPage() {
  useInitFlowbite();
  const { t } = useTranslation("meetings");

  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const state = (location.state ?? {}) as RoomLocationState;

  // (1) state, (2) ?join=, (3) ?meetingId= ile listeden çöz.
  const meetingId = state.meetingId ?? params.get("meetingId");
  const { data: meetings = [] } = useMeetings();

  const joinUrl = useMemo(() => {
    if (state.joinUrl) return state.joinUrl;
    const fromQuery = params.get("join");
    if (fromQuery) return fromQuery;
    if (meetingId) {
      const m = meetings.find((x) => x.id === meetingId);
      if (m?.join_url) return m.join_url;
    }
    return null;
  }, [state.joinUrl, params, meetingId, meetings]);

  const shareUrl = meetingId ? meetingShareUrl(meetingId) : "";

  const displayName = state.displayName;
  const email = state.email;

  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Jitsi durumu → React state (butonların aktif/pasif görünümü buradan sürer).
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [tileView, setTileView] = useState(false);
  const [participants, setParticipants] = useState<JitsiParticipant[]>([]);

  // Sanal arka plan: seçili seçenek id'si (none|blur).
  const [backgroundId, setBackgroundId] = useState("none");

  // Moderatör: JWT'den çöz, yedek olarak yönlendirme state'i.
  const isModerator = useMemo(
    () => (joinUrl ? decodeJitsiModerator(joinUrl) : false) || Boolean(state.isModerator),
    [joinUrl, state.isModerator],
  );
  const [recording, setRecording] = useState(false);
  const [lobbyEnabled, setLobbyEnabled] = useState(false);

  // (1) Geçen süre sayacı: videoConferenceJoined geldiğinde başlar.
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // (2) Sohbet mesajları (Jitsi chat'e bağlı).
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myNick = displayName || t("room.you");

  // (3) Geri bildirim drawer durumu.
  const ratings = useLocalCrud<MeetingRating>("meeting_ratings");
  const [stars, setStars] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Aktif api üzerinde komut çalıştırmak için güvenli yardımcı.
  const run = useCallback((command: string, ...args: unknown[]) => {
    apiRef.current?.executeCommand(command, ...args);
  }, []);

  // Reaksiyon gönder: desteklenmeyen sürümde sessizce no-op (try/catch run içinde).
  const sendReaction = useCallback((reaction: string) => {
    apiRef.current?.executeCommand("sendReaction", reaction);
  }, []);

  // Sanal arka plan uygula. none → kapat, blur → bulanıklaştır.
  const applyBackground = useCallback((id: string) => {
    setBackgroundId(id);
    const api = apiRef.current;
    if (!api) return;
    if (id === "none") {
      api.executeCommand("setVirtualBackground", false);
    } else if (id === "blur") {
      api.executeCommand("setVirtualBackground", true, "blur");
    }
  }, []);

  // --- Moderatör komutları (sunucu desteklemezse sessiz no-op) ---
  const toggleRecording = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    if (recording) {
      api.executeCommand("stopRecording", "file");
    } else {
      api.executeCommand("startRecording", { mode: "file" });
    }
  }, [recording]);

  const muteEveryone = useCallback(() => {
    apiRef.current?.executeCommand("muteEveryone", "audio");
  }, []);

  const toggleLobby = useCallback(() => {
    setLobbyEnabled((prev) => {
      const next = !prev;
      apiRef.current?.executeCommand("toggleLobby", next);
      return next;
    });
  }, []);

  // Geçen süre: joinedAt set olduğunda her saniye güncelle.
  useEffect(() => {
    if (joinedAt == null) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed((Date.now() - joinedAt) / 1000);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [joinedAt]);

  // Yeni mesaj geldiğinde listeyi en alta kaydır.
  useEffect(() => {
    const el = messagesEndRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Mesaj gönder: Jitsi chat'e ilet + yerel listeye ekle.
  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    apiRef.current?.executeCommand("sendChatMessage", text);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-me-${prev.length}`, nick: myNick, text, ts: Date.now(), mine: true },
    ]);
    setDraft("");
  }, [draft, myNick]);

  const submitFeedback = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      ratings.create(
        {
          ...(meetingId ? { meeting_id: meetingId } : {}),
          stars,
          feedback: feedback.trim(),
          created_at: new Date().toISOString(),
        },
        { prepend: true },
      );
      setFeedbackSaved(true);
    },
    [ratings, meetingId, stars, feedback],
  );

  const resetFeedback = useCallback(() => {
    setFeedbackSaved(false);
    setStars(3);
    setFeedback("");
  }, []);

  const leave = useCallback(() => {
    apiRef.current?.executeCommand("hangup");
    navigate("/rate-conversation");
  }, [navigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!joinUrl || !container) return;

    let disposed = false;
    setError(null);
    // Yeni bir görüşmeye geçerken eski durumu sıfırla.
    setParticipants([]);
    setScreenSharing(false);
    setTileView(false);
    setJoinedAt(null);
    setMessages([]);

    // api hazır olunca bağlanacak listener referansları (race-safe temizlik için).
    let cleanupListeners: (() => void) | null = null;

    const syncParticipants = (api: JitsiApi) => {
      try {
        setParticipants(api.getParticipantsInfo() ?? []);
      } catch {
        /* getParticipantsInfo henüz hazır değilse yoksay */
      }
    };

    startJitsiMeeting({ joinUrl, container, displayName, email })
      .then((api) => {
        if (disposed) {
          api.dispose();
          return;
        }
        apiRef.current = api;

        const onAudio = (e: unknown) =>
          setAudioMuted(Boolean((e as { muted?: boolean })?.muted));
        const onVideo = (e: unknown) =>
          setVideoMuted(Boolean((e as { muted?: boolean })?.muted));
        const onScreen = (e: unknown) =>
          setScreenSharing(Boolean((e as { on?: boolean })?.on));
        const onTile = (e: unknown) =>
          setTileView(Boolean((e as { enabled?: boolean })?.enabled));
        const onParticipants = () => syncParticipants(api);
        const onJoined = () => {
          // Başlangıç mute durumlarını çek + mevcut katılımcıları al.
          api.isAudioMuted().then(setAudioMuted).catch(() => {});
          api.isVideoMuted().then(setVideoMuted).catch(() => {});
          syncParticipants(api);
          // (1) Geçen süre sayacı başlangıcı.
          setJoinedAt(Date.now());
        };
        // (2) Gelen sohbet mesajı.
        const onIncomingMessage = (e: unknown) => {
          const m = (e ?? {}) as {
            nick?: string;
            message?: string;
            ts?: number;
            privateMessage?: boolean;
          };
          if (!m.message) return;
          // ts saniye cinsinden gelebilir; ms'e normalize et.
          const tsMs =
            typeof m.ts === "number"
              ? m.ts < 1e12
                ? m.ts * 1000
                : m.ts
              : Date.now();
          setMessages((prev) => [
            ...prev,
            {
              id: `${tsMs}-in-${prev.length}`,
              nick: m.nick || t("room.guest"),
              text: m.message ?? "",
              ts: tsMs,
              mine: false,
            },
          ]);
        };
        const onRecordingChange = (e: unknown) => {
          const on = (e as { on?: boolean })?.on;
          if (typeof on === "boolean") setRecording(on);
        };
        const onReadyToClose = () => navigate("/rate-conversation");

        api.addEventListener("audioMuteStatusChanged", onAudio);
        api.addEventListener("videoMuteStatusChanged", onVideo);
        api.addEventListener("screenSharingStatusChanged", onScreen);
        api.addEventListener("tileViewChanged", onTile);
        api.addEventListener("participantJoined", onParticipants);
        api.addEventListener("participantLeft", onParticipants);
        api.addEventListener("videoConferenceJoined", onJoined);
        api.addEventListener("incomingMessage", onIncomingMessage);
        api.addEventListener("recordingStatusChanged", onRecordingChange);
        api.addEventListener("readyToClose", onReadyToClose);

        // İlk katılımcı anlık görüntüsü (join event'inden önce gelmiş olabilir).
        syncParticipants(api);

        cleanupListeners = () => {
          api.removeEventListener("audioMuteStatusChanged", onAudio);
          api.removeEventListener("videoMuteStatusChanged", onVideo);
          api.removeEventListener("screenSharingStatusChanged", onScreen);
          api.removeEventListener("tileViewChanged", onTile);
          api.removeEventListener("participantJoined", onParticipants);
          api.removeEventListener("participantLeft", onParticipants);
          api.removeEventListener("videoConferenceJoined", onJoined);
          api.removeEventListener("incomingMessage", onIncomingMessage);
          api.removeEventListener("recordingStatusChanged", onRecordingChange);
          api.removeEventListener("readyToClose", onReadyToClose);
        };
      })
      .catch((e: unknown) => {
        if (!disposed) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      disposed = true;
      cleanupListeners?.();
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [joinUrl, displayName, email, navigate]);

  return (
    <>

      <div className="relative flex h-[calc(100dvh-7rem)] w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="max-h-auto relative w-full max-w-6xl overflow-hidden rounded-lg shadow-sm 2xl:max-w-7xl">
          {joinUrl ? (
            <>
              <div
                ref={containerRef}
                className="aspect-video w-full max-w-7xl rounded-lg bg-black shadow-sm"
              />
              {error && (
                <div className="absolute inset-0 grid place-items-center bg-black/70 px-6 text-center text-sm text-white">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-video w-full max-w-7xl rounded-lg bg-gray-100 dark:bg-gray-800 grid place-items-center px-6 text-center">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("room.noLink")}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("room.noLinkHint")}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Gerçek katılımcı şeridi: baş harfi avatarı + displayName. */}
        <div className="absolute bottom-4 end-4 flex flex-row gap-4 sm:justify-end w-[calc(100%-2rem)] overflow-x-scroll pointer-events-none">
          {participants.length === 0 ? (
            <div className="min-w-40 w-40 lg:w-60 min-h-25 h-25 lg:h-40 rounded-lg shadow-sm relative shrink-0 bg-gray-800/80 flex items-center justify-center px-3 text-center pointer-events-auto">
              <span className="text-sm font-medium text-gray-200">
                {t("room.noParticipants")}
              </span>
            </div>
          ) : (
            participants.map((p) => (
              <div
                key={p.participantId}
                className="min-w-40 w-40 lg:w-60 min-h-25 h-25 lg:h-40 rounded-lg shadow-sm relative shrink-0 bg-gray-800 flex items-center justify-center pointer-events-auto"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-base font-semibold text-white">
                  {initials(p.displayName)}
                </span>
                <span className="absolute bottom-1 left-2 text-sm font-medium text-white">
                  {p.displayName || t("room.guest")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-50 grid min-h-16 w-full grid-cols-1 bg-gray-50 px-4 pb-[env(safe-area-inset-bottom)] dark:bg-gray-900 md:grid-cols-3">
        <div className="me-auto hidden items-center justify-center text-gray-500 dark:text-gray-400 md:flex">
          <svg className="me-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z" />
          </svg>
          <span className="text-sm">
            {t("room.runningTime")}{" "}
            {joinedAt == null ? "00:00" : formatElapsed(elapsed)}
          </span>
        </div>
        <div className="mx-auto flex flex-wrap items-center justify-center gap-y-2">
          <button onClick={() => run("toggleAudio")} data-tooltip-target="tooltip-microphone" type="button" className={`group me-4 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 ${audioMuted ? "bg-red-600 hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-800" : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}`}>
            <svg className={`h-4 w-4 ${audioMuted ? "text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 19">
              <path d="M15 5a1 1 0 0 0-1 1v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a1 1 0 0 0-2 0v3a6.006 6.006 0 0 0 6 6h1v2H5a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9v-2h1a6.006 6.006 0 0 0 6-6V6a1 1 0 0 0-1-1Z" />
              <path d="M9 0H7a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3Z" />
            </svg>
            <span className="sr-only">{audioMuted ? t("room.unmuteMicrophone") : t("room.muteMicrophone")}</span>
          </button>
          <div id="tooltip-microphone" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.muteMicrophone")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button data-tooltip-target="tooltip-volume" type="button" className="group me-4 rounded-full bg-gray-100 p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M10.836.357a1.978 1.978 0 0 0-2.138.3L3.63 5H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.63l5.07 4.344a1.985 1.985 0 0 0 2.142.299A1.98 1.98 0 0 0 12 15.826V2.174A1.98 1.98 0 0 0 10.836.357Zm2.728 4.695a1.001 1.001 0 0 0-.29 1.385 4.887 4.887 0 0 1 0 5.126 1 1 0 0 0 1.674 1.095A6.645 6.645 0 0 0 16 9a6.65 6.65 0 0 0-1.052-3.658 1 1 0 0 0-1.384-.29Zm4.441-2.904a1 1 0 0 0-1.664 1.11A10.429 10.429 0 0 1 18 9a10.465 10.465 0 0 1-1.614 5.675 1 1 0 1 0 1.674 1.095A12.325 12.325 0 0 0 20 9a12.457 12.457 0 0 0-1.995-6.852Z" />
            </svg>
            <span className="sr-only">{t("room.adjustVolume")}</span>
          </button>
          <div id="tooltip-volume" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.adjustVolume")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button onClick={() => run("toggleVideo")} data-tooltip-target="tooltip-camera" type="button" className={`group me-4 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 ${videoMuted ? "bg-red-600 hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-800" : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}`}>
            <svg className={`h-4 w-4 ${videoMuted ? "text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
              <path d="M11 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm8.585 1.189a.994.994 0 0 0-.9-.138l-2.965.983a1 1 0 0 0-.685.949v8a1 1 0 0 0 .675.946l2.965 1.02a1.013 1.013 0 0 0 1.032-.242A1 1 0 0 0 20 12V2a1 1 0 0 0-.415-.811Z" />
            </svg>
            <span className="sr-only">{videoMuted ? t("room.showCamera") : t("room.hideCamera")}</span>
          </button>
          <div id="tooltip-camera" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.hideCamera")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          {/* Ekran paylaş */}
          <button onClick={() => run("toggleShareScreen")} data-tooltip-target="tooltip-screenshare" type="button" className={`group me-4 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 ${screenSharing ? "bg-primary-600 hover:bg-primary-700 focus:ring-primary-200 dark:focus:ring-primary-800" : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}`}>
            <svg className={`h-4 w-4 ${screenSharing ? "text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M18 0H2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7v1H6a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-1h7a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm0 13H2V2h16v11Z" />
            </svg>
            <span className="sr-only">{screenSharing ? t("room.stopShareScreen") : t("room.shareScreenAction")}</span>
          </button>
          <div id="tooltip-screenshare" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {screenSharing ? t("room.stopShareScreen") : t("room.shareScreenAction")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          {/* Reaksiyon */}
          <button id="reactionsDropdownButton" data-dropdown-toggle="reactionsDropdown" data-dropdown-placement="top" type="button" className="group me-4 rounded-full bg-gray-100 p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.464 5.535a1 1 0 1 0-1.415-1.414 3 3 0 0 1-4.242 0 1 1 0 0 0-1.415 1.414 5 5 0 0 0 7.072 0Z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">{t("room.reactions")}</span>
          </button>
          <div id="reactionsDropdown" className="z-10 hidden rounded-lg bg-white p-1 shadow-sm dark:bg-gray-700 motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] origin-bottom">
            <div className="flex items-center gap-1">
              {JITSI_REACTIONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => sendReaction(r.key)}
                  className="rounded-full p-2 text-xl leading-none transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 dark:hover:bg-gray-600"
                  aria-label={r.key}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>
          {/* Sanal arka plan */}
          <button id="backgroundDropdownButton" data-dropdown-toggle="backgroundDropdown" data-dropdown-placement="top" type="button" className={`group me-4 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 ${backgroundId !== "none" ? "bg-primary-600 hover:bg-primary-700 focus:ring-primary-200 dark:focus:ring-primary-800" : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}`}>
            <svg className={`h-4 w-4 ${backgroundId !== "none" ? "text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm6 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-2 9 3.5-4.5 2.5 3 3.5-4.5L20 17H6Z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">{t("room.virtualBackground")}</span>
          </button>
          <div id="backgroundDropdown" className="z-10 hidden w-48 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-700 motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] origin-bottom">
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
              {JITSI_BACKGROUNDS.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => applyBackground(b.id)}
                    className={
                      "flex w-full items-center rounded-md px-3 py-2 " +
                      (backgroundId === b.id
                        ? "bg-primary-50 text-primary-700 dark:bg-gray-600 dark:text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600")
                    }
                  >
                    {t(b.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Tile view */}
          <button onClick={() => run("toggleTileView")} data-tooltip-target="tooltip-tileview" type="button" className={`group me-4 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 ${tileView ? "bg-primary-600 hover:bg-primary-700 focus:ring-primary-200 dark:focus:ring-primary-800" : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"}`}>
            <svg className={`h-4 w-4 ${tileView ? "text-white" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
              <path d="M7 0H2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm9 0h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM7 9H2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm9 0h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Z" />
            </svg>
            <span className="sr-only">{t("room.tileView")}</span>
          </button>
          <div id="tooltip-tileview" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.tileView")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          {/* El kaldır */}
          <button onClick={() => run("toggleRaiseHand")} data-tooltip-target="tooltip-raisehand" type="button" className="group me-4 rounded-full bg-gray-100 p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 8.5V5a1.5 1.5 0 0 1 3 0v2.5h.5V4a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 7.5-7 7.5a6.5 6.5 0 0 1-6.4-5.3l-.6-3.1a1.5 1.5 0 0 1 2.9-.8l.6 2V2a1.5 1.5 0 0 1 3 0v6.5H11Z" />
            </svg>
            <span className="sr-only">{t("room.raiseHand")}</span>
          </button>
          <div id="tooltip-raisehand" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.raiseHand")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button onClick={leave} data-tooltip-target="tooltip-end-call" type="button" className="group me-4 rounded-full bg-red-600 p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 dark:bg-red-600 dark:hover:bg-red-600 dark:focus:ring-red-800 md:me-0">
            <svg className="h-4 w-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 6.995c-2.306 0-4.534.408-6.215 1.507-1.737 1.135-2.788 2.944-2.797 5.451a4.8 4.8 0 0 0 .01.62c.015.193.047.512.138.763a2.557 2.557 0 0 0 2.579 1.677H7.31a2.685 2.685 0 0 0 2.685-2.684v-.645a.684.684 0 0 1 .684-.684h2.647a.686.686 0 0 1 .686.687v.645c0 .712.284 1.395.787 1.898.478.478 1.101.787 1.847.787h1.647a2.555 2.555 0 0 0 2.575-1.674c.09-.25.123-.57.137-.763.015-.2.022-.433.01-.617-.002-2.508-1.049-4.32-2.785-5.458-1.68-1.1-3.907-1.51-6.213-1.51Z" />
            </svg>
            <span className="sr-only">{t("room.endCall")}</span>
          </button>
          <div id="tooltip-end-call" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.endCall")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button id="moreOptionsDropdownButton" data-dropdown-toggle="moreOptionsDropdown" type="button" className="group rounded-full bg-gray-100 p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800 md:hidden">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
            <span className="sr-only">{t("room.showOptions")}</span>
          </button>
          <div id="moreOptionsDropdown" className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:divide-gray-600 dark:bg-gray-700 motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] origin-top">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="moreOptionsDropdownButton">
              <li>
                  <button type="button" data-drawer-target="drawer-participants" data-drawer-show="drawer-participants" data-drawer-placement="right" className="flex items-center w-full px-4 py-2 text-left transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z" clipRule="evenodd" />
                    </svg>
                    {t("room.showParticipants")}
                  </button>
              </li>
              <li>
                <button type="button" data-drawer-target="drawer-messages" data-drawer-show="drawer-messages" data-drawer-placement="right" className="flex items-center w-full px-4 py-2 text-left transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd" />
                  </svg>
                  {t("room.sendMessages")}
                </button>
              </li>
              <li>
                <button type="button" data-drawer-target="feedback-drawer" data-drawer-show="feedback-drawer" data-drawer-placement="right" className="flex items-center w-full px-4 py-2 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM7.99 9a1 1 0 0 1 1-1H9a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1ZM14 9a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H15a1 1 0 0 1-1-1Zm-5.506 7.216A5.5 5.5 0 0 1 6.6 13h10.81a5.5 5.5 0 0 1-8.916 3.216Z" clipRule="evenodd" />
                  </svg>
                  {t("room.shareFeedback")}</button>
              </li>
              <li>
                <button type="button" data-dropdown-toggle="reactionsDropdown" className="flex items-center w-full px-4 py-2 text-left transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7 9a1 1 1 1 1 0-2 1 1 0 0 1 0 2Zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.464 5.535a1 1 0 1 0-1.415-1.414 3 3 0 0 1-4.242 0 1 1 0 0 0-1.415 1.414 5 5 0 0 0 7.072 0Z" clipRule="evenodd" />
                  </svg>
                  {t("room.reactions")}
                </button>
              </li>
              <li>
                <button type="button" data-dropdown-toggle="backgroundDropdown" className="flex items-center w-full px-4 py-2 text-left transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm6 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-2 9 3.5-4.5 2.5 3 3.5-4.5L20 17H6Z" clipRule="evenodd" />
                  </svg>
                  {t("room.virtualBackground")}
                </button>
              </li>
              {isModerator && (
                <li>
                  <button type="button" data-drawer-target="settings-drawer" data-drawer-show="settings-drawer" className="flex items-center w-full px-4 py-2 text-left transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                    </svg>
                    {t("room.hostControls")}
                  </button>
                </li>
              )}
              <li>
                <button type="button" data-modal-toggle="details-modal" className="flex items-center w-full px-4 py-2 text-left transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z" clipRule="evenodd" />
                  </svg>
                  {t("room.meetingDetails")}</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="ms-auto hidden items-center justify-center md:flex">
          <button data-tooltip-target="tooltip-participants" data-drawer-show="drawer-participants" type="button" className="group me-1 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-600">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
            </svg>
            <span className="sr-only">{t("room.showParticipants")}</span>
          </button>
          <div id="tooltip-participants" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.showParticipants")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button data-tooltip-target="tooltip-messages" data-drawer-init="drawer-messages" data-drawer-show="drawer-messages" type="button" className="group me-1 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-600">
            <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">{t("room.messages")}</span>
          </button>
          <div id="tooltip-messages" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.messages")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button data-tooltip-target="tooltip-feedback" data-drawer-show="feedback-drawer" type="button" className="group me-1 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-600">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM13.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3.5 9.5A5.5 5.5 0 0 1 4.6 11h10.81A5.5 5.5 0 0 1 10 15.5Z" />
            </svg>
            <span className="sr-only">{t("room.shareFeedback")}</span>
          </button>
          <div id="tooltip-feedback" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.shareFeedback")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          {isModerator && (
            <>
              <button data-tooltip-target="tooltip-host" data-drawer-target="settings-drawer" data-drawer-show="settings-drawer" type="button" className="group me-1 rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">{t("room.hostControls")}</span>
              </button>
              <div id="tooltip-host" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                {t("room.hostControls")}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </>
          )}
          <button data-tooltip-target="tooltip-information" data-modal-target="details-modal" data-modal-toggle="details-modal" type="button" className="group rounded-full p-2.5 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-600">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">{t("room.showInformation")}</span>
          </button>
          <div id="tooltip-information" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            {t("room.meetingDetails")}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </div>

      {/* Meeting details modal */}
      <div id="details-modal" tabIndex={-1} aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0">
        <div className="relative max-h-full w-full max-w-lg p-4">
          {/* Modal content */}
          <div className="relative rounded-lg bg-white shadow-sm dark:bg-gray-800">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 md:p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("room.meetingDetails")}</h3>
              <button type="button" className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white" data-modal-toggle="details-modal">
                <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">{t("room.closeModal")}</span>
              </button>
            </div>
            {/* Modal body */}
            <div className="px-4 pb-4 md:px-5 md:pb-5">
              <label htmlFor="link-url" className="label">{t("room.shareLink")}</label>
              <div className="relative mb-4">
                <input id="link-url" type="text" className="input" value={shareUrl || t("room.noShareLink")} disabled readOnly />
                <button data-copy-to-clipboard-target="link-url" data-tooltip-target="tooltip-link-url" className="absolute end-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                  <span id="default-icon-link-url">
                    <svg className="h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                      <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                    </svg>
                  </span>
                  <span id="success-icon-link-url" className="hidden">
                    <svg className="h-3.5 w-3.5 text-primary-700 dark:text-primary-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
                    </svg>
                  </span>
                </button>
                <div id="tooltip-link-url" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                  <span id="default-tooltip-message-link-url">{t("room.copyToClipboard")}</span>
                  <span id="success-tooltip-message-link-url" className="hidden">{t("room.copied")}</span>
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>
              <button type="button" data-modal-hide="details-modal" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                {t("room.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* messages drawer */}
      <div id="drawer-messages" className="fixed right-0 top-0 z-40 h-[calc(100dvh-4rem)] w-[min(20rem,100vw)] translate-x-full overflow-y-auto bg-white p-4 transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] dark:bg-gray-800 flex justify-between flex-col" tabIndex={-1} aria-labelledby="drawer-messages-label">
          <div>
              <h5 id="drawer-messages-label" className="mb-4 inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">{t("room.messagesTitle")}</h5>
              <button type="button" data-drawer-hide="drawer-messages" aria-controls="drawer-messages" className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("room.closeMenu")}</span>
              </button>

              <div ref={messagesEndRef} className="overflow-scroll h-[calc(100dvh-13rem)] mb-2">
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("room.noMessages")}</p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={
                          "flex items-start gap-2.5 mb-4 " +
                          (m.mine ? "flex-row-reverse" : "")
                        }
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">
                          {initials(m.nick)}
                        </span>
                        <div className="flex flex-col w-full max-w-[260px] leading-1.5">
                          <div className={"flex items-center space-x-2 rtl:space-x-reverse " + (m.mine ? "flex-row-reverse space-x-reverse" : "")}>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.nick}</span>
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{formatClock(m.ts)}</span>
                          </div>
                          <p className={"text-sm font-normal py-2 px-3 mt-1 rounded-lg " + (m.mine ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white")}>{m.text}</p>
                        </div>
                      </div>
                    ))
                  )}
              </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
              <label htmlFor="chat" className="sr-only">{t("room.yourMessage")}</label>
              <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <textarea
                    id="chat"
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="input me-2"
                    placeholder={t("room.messagePlaceholder")}
                  ></textarea>
                      <button type="submit" className="inline-flex justify-center p-2 text-primary-600 rounded-full cursor-pointer hover:bg-primary-100 dark:text-primary-500 dark:hover:bg-gray-600">
                      <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                          <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                      </svg>
                      <span className="sr-only">{t("room.sendMessage")}</span>
                  </button>
              </div>
          </form>

        </div>


      {/* participants drawer */}
      <div id="drawer-participants" className="fixed right-0 top-0 z-40 h-[calc(100dvh-4rem)] w-[min(20rem,100vw)] translate-x-full overflow-y-auto bg-white p-4 transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] dark:bg-gray-800" tabIndex={-1} aria-labelledby="drawer-participants-label">
          <div>
              <h5 id="drawer-participants-label" className="mb-4 inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">{t("room.participantsTitle")}</h5>
              <button type="button" data-drawer-hide="drawer-participants" aria-controls="drawer-participants" className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("room.closeMenu")}</span>
              </button>

              <label htmlFor="search-input-participants" className="sr-only">{t("room.searchPeople")}</label>
              <div className="relative mb-6">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
              </div>
              <input type="text" id="search-input-participants" className="input ps-10" placeholder={t("room.searchPeople")} />
              </div>
          
              <div className="overflow-y-scroll mb-2 space-y-4">
                  {participants.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("room.noParticipants")}
                    </p>
                  )}
                  {participants.map((p) => (
                    <div key={p.participantId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">
                            {initials(p.displayName)}
                          </span>
                          <div className="flex flex-col w-full max-w-[320px] leading-1.5">
                              <span className="text-base font-medium text-gray-900 dark:text-white">{p.displayName || t("room.guest")}</span>
                              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">{p.role === "moderator" ? t("room.meetingHost") : t("room.participant")}</p>
                          </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => shareUrl && navigator.clipboard?.writeText(shareUrl)} className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-sm font-medium text-white transition-[transform,colors] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto">
                      <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                      </svg>
                      {t("room.inviteOthers")}
                  </button>
              </div>
          </div>

      </div>

      {/* settings drawer */}
      {isModerator && (
      <div id="settings-drawer" className="fixed right-0 top-0 z-40 h-[calc(100dvh-4rem)] w-[min(20rem,100vw)] translate-x-full overflow-y-auto bg-white p-4 transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] dark:bg-gray-800" tabIndex={-1} aria-labelledby="settings-drawer-label">
          <div>
              <h5 id="settings-drawer-label" className="mb-4 inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">{t("room.hostControls")}</h5>
              <button type="button" data-drawer-hide="settings-drawer" aria-controls="settings-drawer" className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("room.closeMenu")}</span>
              </button>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <p className="text-gray-900 text-sm font-semibold dark:text-white me-1">{t("room.meetingModeration")}</p>
                  <button type="button" data-tooltip-target="tooltip-info-meet" className="cursor-pointer text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div id="tooltip-info-meet" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                      {t("room.moderationTooltip")}
                      <div className="tooltip-arrow" data-popper-arrow></div>
                  </div>
                </div>
                <button type="button" data-moderation-checkbox-toggle="false" className="text-primary-700 dark:text-primary-600 hover:underline focus:outline-none focus:underline text-sm font-medium">{t("room.toggleAll")}</button>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{t("room.moderationDescription")}</p>
              
              <div className="space-y-2 mb-5">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" data-moderation-checkbox />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.shareScreen")}</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" data-moderation-checkbox />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.sendChatMessages")}</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" data-moderation-checkbox defaultChecked />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.sendReactions")}</span>
                </label>
                <label className="inline-flex items-start cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" data-moderation-checkbox />
                  <div className="shrink-0 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <div className="flex flex-col">
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.turnOnMicrophone")}</span>
                    <span className="ms-3 text-xs text-gray-500 dark:text-gray-400">{t("room.turnOnMicrophoneHint")}</span>
                  </div>
                </label>
                <label className="inline-flex items-start cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" data-moderation-checkbox />
                  <div className="shrink-0 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <div className="flex flex-col">
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.turnOnVideo")}</span>
                    <span className="ms-3 text-xs text-gray-500 dark:text-gray-400">{t("room.turnOnVideoHint")}</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center mb-5">
                <p className="text-gray-900 text-sm font-semibold dark:text-white me-1">{t("room.accessType")}</p>
                <button type="button" data-tooltip-target="tooltip-access-type" className="cursor-pointer text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z" clipRule="evenodd" />
                  </svg>
                </button>
                <div id="tooltip-access-type" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    {t("room.accessTooltip")}
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <label className="inline-flex items-start cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="shrink-0 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <div className="flex flex-col">
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.open")}</span>
                    <span className="ms-3 text-xs text-gray-500 dark:text-gray-400">{t("room.openHint")}</span>
                  </div>
                </label>
                <label className="inline-flex items-start cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="shrink-0 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <div className="flex flex-col">
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.trusted")}</span>
                    <span className="ms-3 text-xs text-gray-500 dark:text-gray-400">{t("room.trustedHint")}</span>
                  </div>
                </label>
              </div>

              {/* Gerçek moderatör aksiyonları */}
              {isModerator && (
              <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={
                    "flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 " +
                    (recording
                      ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 dark:focus:ring-red-800"
                      : "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800")
                  }
                >
                  {recording ? t("room.stopRecording") : t("room.startRecording")}
                </button>
                <button
                  type="button"
                  onClick={muteEveryone}
                  className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                >
                  {t("room.muteEveryone")}
                </button>
                <label className="inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="sr-only peer" checked={lobbyEnabled} onChange={toggleLobby} />
                  <div className="relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800 rtl:peer-checked:after:-translate-x-full"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">{t("room.lobbyEnabled")}</span>
                </label>
              </div>
              )}

          </div>

      </div>
      )}


      {/* submit feedback drawer */}
      <div id="feedback-drawer" className="fixed right-0 top-0 z-40 h-[100dvh] w-full max-w-md translate-x-full overflow-y-auto bg-white p-4 antialiased transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] dark:bg-gray-800" tabIndex={-1} aria-labelledby="feedback-drawer-label" aria-hidden="true">
        <h5 id="feedback-drawer-label" className="mb-6 inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">{t("feedback.submitFeedback")}</h5>
        <button type="button" data-drawer-dismiss="feedback-drawer" aria-controls="feedback-drawer" className="absolute right-2.5 top-2.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
          <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
          <span className="sr-only">{t("feedback.closeMenu")}</span>
        </button>
        <form action="#" onSubmit={submitFeedback}>
          {feedbackSaved ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-gray-700 dark:text-green-400">
                <svg className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">{t("feedback.sent")}</p>
                  <p>{t("feedback.thanks")}</p>
                </div>
              </div>
              <div className="flex w-full justify-center space-x-3 pb-4">
                <button type="button" onClick={resetFeedback} className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                  {t("feedback.newFeedback")}
                </button>
                <button type="button" data-drawer-dismiss="feedback-drawer" aria-controls="feedback-drawer" onClick={resetFeedback} className="w-full justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  {t("feedback.close")}
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  aria-label={`${n} ${t("feedback.happy")}`}
                  className={(n === 1 ? "" : "ms-2 ") + "transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.92]"}
                >
                  <svg
                    className={
                      "h-6 w-6 cursor-pointer " +
                      (n <= stars ? "text-yellow-300" : "text-gray-300 dark:text-gray-500")
                    }
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                  >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                  </svg>
                </button>
              ))}
              <span className="ms-2 text-sm font-semibold text-gray-900 dark:text-white">{stars}/5</span>
            </div>
            <div>
              <label htmlFor="feedback" className="label">{t("feedback.yourFeedback")} <span className="dark:text-gray-400 font-normal text-gray-500">{t("feedback.feedbackChars")}</span></label>
              <textarea id="feedback" rows={5} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="input mb-2" required></textarea>
              <p className="ms-auto text-xs text-gray-500 dark:text-gray-400">{t("feedback.feedbackHint")}</p>
            </div>
            <div>
              <p className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("feedback.addPhotos")} <span className="text-gray-500 dark:text-gray-400">{t("feedback.optional")}</span></p>
              <div className="flex w-full items-center justify-center">
                <label htmlFor="dropzone-file" className="dark:hover:bg-bray-800 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">{t("feedback.clickToUpload")}</span>{t("feedback.dragAndDrop")}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("feedback.maxFile")}</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex w-full justify-center space-x-3 pb-4">
              <button type="submit" className="w-full justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                {t("feedback.submit")}
              </button>
              <button type="button" data-drawer-dismiss="feedback-drawer" aria-controls="feedback-drawer" className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                {t("feedback.cancel")}
              </button>
            </div>
          </div>
          )}
        </form>
      </div>

    </>
  );
}
