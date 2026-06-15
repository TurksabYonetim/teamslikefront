import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInitFlowbite } from "@/lib/flowbite";
import { Logo } from "@/components/Logo";
import { useGuestToken } from "./meetings.hooks";
import { useMe } from "@/features/auth/auth.hooks";

/**
 * Flowbite "join-call.html" sayfasından çevrildi. Markup/stil korunur.
 * Davranış eklendi:
 *  - Cihaz seçiciler (mikrofon/hoparlör/kamera) controlled state + gerçek
 *    cihazlar (navigator.mediaDevices.enumerateDevices). İzin yoksa statik
 *    etiketler fallback olarak kalır.
 *  - Önizleme kontrol butonları (mikrofon/kamera/efekt) toggle state.
 *  - Kamera açıldığında getUserMedia ile gerçek önizleme <video>'da gösterilir,
 *    izin reddedilirse statik görsele düşülür.
 *  - "Sun" (present) / "Yardımcı modu" toggle state + görsel geri bildirim.
 *  - "Katılmak için iste" guest-token→/room akışı korunur.
 */
type DeviceOption = { deviceId: string; label: string };
type PermState = "granted" | "denied" | "prompt" | "unknown";
type Tone = "ok" | "warn" | "fail";

interface MeetingLobbyPageProps {
  /** Verilirse query param yerine bu kullanılır (public /j/:meetingId rotası). */
  meetingId?: string;
}

export function MeetingLobbyPage({ meetingId: meetingIdProp }: MeetingLobbyPageProps = {}) {
  useInitFlowbite();
  const navigate = useNavigate();
  const { t } = useTranslation("meetings");
  const [params] = useSearchParams();
  const meetingId = meetingIdProp ?? params.get("meetingId");
  const guestToken = useGuestToken();
  const me = useMe();
  const displayName =
    params.get("guest") ||
    me.data?.full_name ||
    me.data?.email?.split("@")[0] ||
    t("lobby.you");
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";

  // --- Cihaz listeleri (gerçek cihazlar; yoksa statik fallback) ---
  // Başlangıçta dürüst genel etiketler (sahte cihaz adı yok). İzin verilince
  // navigator.mediaDevices.enumerateDevices ile GERÇEK cihaz adlarıyla dolar.
  const [mics, setMics] = useState<DeviceOption[]>([
    { deviceId: "default", label: t("lobby.defaultMic") },
  ]);
  const [speakers, setSpeakers] = useState<DeviceOption[]>([
    { deviceId: "default", label: t("lobby.defaultSpeaker") },
  ]);
  const [cameras, setCameras] = useState<DeviceOption[]>([
    { deviceId: "default", label: t("lobby.defaultCamera") },
  ]);

  const [selectedMic, setSelectedMic] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState(0);

  // --- Önizleme toggle durumları ---
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [effectsOn, setEffectsOn] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [companionMode, setCompanionMode] = useState(false);

  // --- "Sorun bildir" / "Sorun giderme" modal durumları ---
  const [reportOpen, setReportOpen] = useState(false);
  const [diagOpen, setDiagOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportError, setReportError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [micPerm, setMicPerm] = useState<PermState>("unknown");
  const [camPerm, setCamPerm] = useState<PermState>("unknown");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const map = (kind: MediaDeviceInfo["kind"], fallbackPrefix: string) =>
        devices
          .filter((d) => d.kind === kind && d.label)
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `${fallbackPrefix} ${i + 1}` }));
      const m = map("audioinput", "Mic");
      const s = map("audiooutput", "Speaker");
      const c = map("videoinput", "Camera");
      if (m.length) setMics(m);
      if (s.length) setSpeakers(s);
      if (c.length) setCameras(c);
    } catch {
      // İzin yok → statik fallback'te kal.
    }
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Kamera açık olduğunda gerçek önizleme akışını al.
  useEffect(() => {
    let cancelled = false;
    const stop = () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
    if (cameraOn && navigator.mediaDevices?.getUserMedia) {
      const camId = cameras[selectedCamera]?.deviceId;
      navigator.mediaDevices
        .getUserMedia({
          video: camId && camId !== "default" ? { deviceId: { ideal: camId } } : true,
          // audio izni de istenir → tek prompt'la mikrofon/hoparlör/kamera
          // GERÇEK adları (enumerateDevices) açılır. Ses track'i kullanılmaz.
          audio: true,
        })
        .then((stream) => {
          stream.getAudioTracks().forEach((tr) => tr.stop());
          if (cancelled) {
            stream.getTracks().forEach((tr) => tr.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          // İzin verildikten sonra gerçek etiketleri tazele.
          refreshDevices();
        })
        .catch(() => {
          // İzin reddedildi → statik görsele düş.
          if (!cancelled) setCameraOn(false);
        });
    } else {
      stop();
    }
    return () => {
      cancelled = true;
      stop();
    };
  }, [cameraOn, selectedCamera, cameras, refreshDevices]);

  const askToJoin = () => {
    if (!meetingId) {
      navigate("/room");
      return;
    }
    guestToken.mutate(
      { meetingId, body: { guest_name: displayName } },
      {
        onSuccess: (res) => {
          navigate("/room", {
            state: { joinUrl: res.join_url, displayName },
          });
        },
        onError: () => navigate("/room"),
      },
    );
  };

  // --- Tanılama (sorun bildir / sorun giderme) ---
  // Tarayıcı izin durumlarını sorgular (varsa Permissions API).
  const queryPermissions = useCallback(async () => {
    const q = async (name: string): Promise<PermState> => {
      try {
        const r = await navigator.permissions?.query({ name: name as PermissionName });
        return (r?.state as PermState) ?? "unknown";
      } catch {
        return "unknown";
      }
    };
    setMicPerm(await q("microphone"));
    setCamPerm(await q("camera"));
  }, []);

  // Cihaz + izinleri yeniden tara ("Yeniden tara" butonu).
  const rescan = useCallback(async () => {
    setScanning(true);
    await Promise.all([refreshDevices(), queryPermissions()]);
    setScanning(false);
  }, [refreshDevices, queryPermissions]);

  const openReport = () => {
    setReportText("");
    setReportError(false);
    setSubmitted(false);
    setCopied(false);
    queryPermissions();
    refreshDevices();
    setReportOpen(true);
  };

  const openDiagnostics = () => {
    setDiagOpen(true);
    rescan();
  };

  // Sorun bildirimine otomatik eklenen teknik tanılama metni.
  const buildDiagnostics = () =>
    [
      `${t("lobby.diag.browser")}: ${navigator.userAgent}`,
      `${t("lobby.diag.micPermission")}: ${micPerm}`,
      `${t("lobby.diag.cameraPermission")}: ${camPerm}`,
      `${t("lobby.diag.micDevice")}: ${mics[selectedMic]?.label ?? "-"} (${mics.length})`,
      `${t("lobby.diag.speakerDevice")}: ${speakers[selectedSpeaker]?.label ?? "-"} (${speakers.length})`,
      `${t("lobby.diag.cameraDevice")}: ${cameras[selectedCamera]?.label ?? "-"} (${cameras.length})`,
      `Meeting: ${meetingId ?? "-"}`,
      `Viewport: ${window.innerWidth}×${window.innerHeight}`,
    ].join("\n");

  const copyReport = async () => {
    const payload = `${reportText.trim()}\n\n--- ${t("lobby.report.diagnostics")} ---\n${buildDiagnostics()}`;
    try {
      await navigator.clipboard?.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pano erişimi yoksa sessizce geç.
    }
  };

  const submitReport = async () => {
    if (!reportText.trim()) {
      setReportError(true);
      return;
    }
    // Backend bağlanana kadar: tanılamayla birlikte panoya kopyala + onay göster.
    await copyReport();
    setSubmitted(true);
  };

  // İzin durumunu rozet bilgisine çevirir.
  const permInfo = (p: PermState): { tone: Tone; label: string } =>
    p === "granted"
      ? { tone: "ok", label: t("lobby.diag.permGranted") }
      : p === "denied"
        ? { tone: "fail", label: t("lobby.diag.permDenied") }
        : p === "prompt"
          ? { tone: "warn", label: t("lobby.diag.permPrompt") }
          : { tone: "warn", label: t("lobby.diag.unknown") };

  // Cihaz listesini rozet bilgisine çevirir (gerçek etiket = hazır).
  const deviceInfo = (list: DeviceOption[], sel: number): { tone: Tone; label: string } =>
    list[sel] && list[sel].deviceId !== "default"
      ? { tone: "ok", label: list[sel].label }
      : { tone: "warn", label: list[sel]?.label ?? t("lobby.diag.noDevice") };

  const toneBadge = (tone: Tone) =>
    "ms-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium " +
    (tone === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : tone === "fail"
        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300");

  const diagRows: { label: string; info: { tone: Tone; label: string } }[] = [
    { label: t("lobby.diag.micPermission"), info: permInfo(micPerm) },
    { label: t("lobby.diag.cameraPermission"), info: permInfo(camPerm) },
    { label: t("lobby.diag.micDevice"), info: deviceInfo(mics, selectedMic) },
    { label: t("lobby.diag.cameraDevice"), info: deviceInfo(cameras, selectedCamera) },
    { label: t("lobby.diag.speakerDevice"), info: deviceInfo(speakers, selectedSpeaker) },
  ];

  // Aktif yuvarlak buton stili (toggle görsel geri bildirimi).
  const ctrlBtn = (active: boolean) =>
    "group me-4 rounded-full p-2.5 transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)] focus:outline-none focus:ring-4 " +
    (active
      ? "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
      : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700");
  const ctrlIcon = (active: boolean) =>
    "h-4 w-4 " +
    (active
      ? "text-white"
      : "text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white");

  return (
    <>

      <section>
        <div className="mx-auto h-[calc(100vh-8rem)] max-w-7xl place-items-center px-4 py-8 md:grid md:grid-cols-12 md:gap-x-8 lg:py-0 xl:gap-16 xl:px-0">
          <div className="mb-4 md:col-span-6 md:mb-0">
            <div className="relative mb-4">
              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="mx-auto h-auto w-[512px] rounded-lg bg-gray-900 shadow-lg lg:mx-0 lg:w-full"
                />
              ) : (
                <div className="relative mx-auto flex aspect-video w-[512px] items-center justify-center rounded-lg bg-gray-900 shadow-lg lg:mx-0 lg:w-full">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-700 text-2xl font-semibold text-white">{initials}</span>
                  <span className="absolute bottom-3 end-4 text-xs font-medium text-gray-200">{t("lobby.cameraOff")}</span>
                </div>
              )}
              <span className="absolute bottom-3 start-4 text-sm font-medium text-white drop-shadow">{displayName}</span>
            </div>
            <div className="mx-auto flex items-center justify-center">
              <button onClick={() => setMicOn((v) => !v)} aria-pressed={micOn} data-tooltip-target="tooltip-microphone" type="button" className={ctrlBtn(micOn)}>
                <svg className={ctrlIcon(micOn)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 19">
                  <path d="M15 5a1 1 0 0 0-1 1v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a1 1 0 0 0-2 0v3a6.006 6.006 0 0 0 6 6h1v2H5a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9v-2h1a6.006 6.006 0 0 0 6-6V6a1 1 0 0 0-1-1Z"></path>
                  <path d="M9 0H7a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3Z"></path>
                </svg>
                <span className="sr-only">{t("lobby.muteMicrophone")}</span>
              </button>
              <div id="tooltip-microphone" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700" data-popper-placement="top">
                {t("lobby.muteMicrophone")}
                <div className="tooltip-arrow" data-popper-arrow=""></div>
              </div>
              <button onClick={() => setCameraOn((v) => !v)} aria-pressed={cameraOn} data-tooltip-target="tooltip-camera" type="button" className={ctrlBtn(cameraOn)}>
                <svg className={ctrlIcon(cameraOn)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                  <path d="M11 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm8.585 1.189a.994.994 0 0 0-.9-.138l-2.965.983a1 1 0 0 0-.685.949v8a1 1 0 0 0 .675.946l2.965 1.02a1.013 1.013 0 0 0 1.032-.242A1 1 0 0 0 20 12V2a1 1 0 0 0-.415-.811Z"></path>
                </svg>
                <span className="sr-only">{t("lobby.hideCamera")}</span>
              </button>
              <div id="tooltip-camera" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700" data-popper-placement="top">
                {t("lobby.hideCamera")}
                <div className="tooltip-arrow" data-popper-arrow=""></div>
              </div>
              <button onClick={() => setEffectsOn((v) => !v)} aria-pressed={effectsOn} data-tooltip-target="tooltip-visual-effects" type="button" className={ctrlBtn(effectsOn)}>
                <svg className={ctrlIcon(effectsOn)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M17.44 3a1 1 0 0 1 .707.293l2.56 2.56a1 1 0 0 1 0 1.414L18.194 9.78 14.22 5.806l2.513-2.513A1 1 0 0 1 17.44 3Zm-4.634 4.22-9.513 9.513a1 1 0 0 0 0 1.414l2.56 2.56a1 1 0 0 0 1.414 0l9.513-9.513-3.974-3.974ZM6 6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 0 1 0-2h1V7a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                  <path d="M19 13h-2v2h2v-2ZM13 3h-2v2h2V3Zm-2 2H9v2h2V5ZM9 3H7v2h2V3Zm12 8h-2v2h2v-2Zm0 4h-2v2h2v-2Z" />
                </svg>
                <span className="sr-only">{t("lobby.visualEffects")}</span>
              </button>
              <div id="tooltip-visual-effects" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700" data-popper-placement="top">
                {t("lobby.visualEffectsTooltip")}
                <div className="tooltip-arrow" data-popper-arrow=""></div>
              </div>
              <button id="moreOptionsDropdownButton" data-dropdown-toggle="moreOptionsDropdown" type="button" className="group me-4 rounded-full bg-gray-100 p-2.5 transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)] hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
                <svg className="h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                  <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"></path>
                </svg>
                <span className="sr-only">{t("lobby.showOptions")}</span>
              </button>
              <div id="moreOptionsDropdown" className="z-10 hidden w-56 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:divide-gray-600 dark:bg-gray-700" data-popper-reference-hidden="" data-popper-escaped="" data-popper-placement="bottom">
                <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="ticket-3-dropdown-button">
                  <li>
                    <button type="button" onClick={openReport} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z" clipRule="evenodd" />
                      </svg>
                      {t("lobby.reportProblem")}
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={openDiagnostics} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5c.47 0 .917-.092 1.326-.26l1.967 1.967a1 1 0 0 0 1.414-1.414l-1.817-1.818A3.5 3.5 0 1 0 11.5 17Z" clipRule="evenodd" />
                      </svg>
                      {t("lobby.troubleshooting")}
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => navigate("/settings")} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                      </svg>
                      {t("lobby.settings")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="w-full md:col-span-6">
            <div className="mb-4 hidden md:block lg:mb-6">
              <Logo className="h-8" />
            </div>
            <h1 className="mb-4 text-center text-xl font-semibold tracking-tight text-ink dark:text-white md:text-start">{t("lobby.readyToJoin")}</h1>
            <div className="flex w-full items-center justify-center space-x-4 dark:border-gray-800 md:justify-start lg:mb-6 lg:border-b lg:border-gray-200 lg:pb-6">
              <button type="button" onClick={askToJoin} disabled={guestToken.isPending} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary-700 bg-primary-700 px-3 py-2.5 text-center text-sm font-medium text-white transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)] hover:border-primary-800 hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60 dark:border-primary-600 dark:bg-primary-600 dark:hover:border-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                {guestToken.isPending ? "…" : t("lobby.askToJoin")}
              </button>
              <button type="button" onClick={() => setPresenting((v) => !v)} aria-pressed={presenting} className={"hidden shrink-0 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)] focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 lg:flex " + (presenting ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-primary-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-primary-500 dark:hover:bg-gray-700 dark:hover:text-white")}>
                <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v5m-3 0h6M4 11h16M5 15h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1Z" />
                </svg>

                {presenting ? t("lobby.presenting") : t("lobby.present")}
              </button>
              <button type="button" onClick={() => setCompanionMode((v) => !v)} aria-pressed={companionMode} className={"flex shrink-0 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)] focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 " + (companionMode ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-primary-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-primary-500 dark:hover:bg-gray-700 dark:hover:text-white")}>
                <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 5a1 1 0 0 1 1-1h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1a1 1 0 1 1 0-2h1V6H9a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4 7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4Zm0 11v-5.5h11V18H4Z" clipRule="evenodd" />
                </svg>
                {companionMode ? t("lobby.companionModeActive") : t("lobby.useCompanionMode")}
              </button>
            </div>
            <div className="hidden items-center lg:flex">
              <button type="button" id="microphoneDropdownButton" data-dropdown-toggle="microphoneDropdown" className="flex items-center pr-5 text-sm font-medium text-muted hover:underline dark:text-gray-400">
                <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M5 8a1 1 0 0 1 1 1v3a4.006 4.006 0 0 0 4 4h4a4.006 4.006 0 0 0 4-4V9a1 1 0 1 1 2 0v3.001A6.006 6.006 0 0 1 14.001 18H13v2h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2H9.999A6.006 6.006 0 0 1 4 12.001V9a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                  <path d="M7 6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z" />
                </svg>
                <span className="max-w-[12rem] truncate">{mics[selectedMic]?.label}</span>
                <svg className="ms-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                </svg>
              </button>
              <div id="microphoneDropdown" className="z-10 hidden w-80 rounded-lg bg-white shadow-sm dark:bg-gray-700">
                <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="microphoneDropdownButton">
                  {mics.map((m, i) => (
                    <li key={m.deviceId || i}>
                      <button
                        type="button"
                        onClick={() => setSelectedMic(i)}
                        title={t("lobby.selectMicrophone")}
                        className={
                          i === selectedMic
                            ? "inline-flex w-full items-center rounded-md px-3 py-2 text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-600"
                            : "inline-flex w-full items-center rounded-md px-3 py-2 ps-[38px] hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                        }
                      >
                        {i === selectedMic && (
                          <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                          </svg>
                        )}
                        <span className="truncate text-start">{m.label}</span>
                      </button>
                    </li>
                  ))}
                  <li className="mt-2 flex items-center space-x-2 border-t border-gray-200 pb-1 pt-3 dark:border-gray-600">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M5 8a1 1 0 0 1 1 1v3a4.006 4.006 0 0 0 4 4h4a4.006 4.006 0 0 0 4-4V9a1 1 0 1 1 2 0v3.001A6.006 6.006 0 0 1 14.001 18H13v2h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2H9.999A6.006 6.006 0 0 1 4 12.001V9a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                      <path d="M7 6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z" />
                    </svg>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                      <div className="h-1.5 rounded-full bg-primary-700" style={{ width: micOn ? "45%" : "0%" }}></div>
                    </div>
                  </li>
                </ul>
              </div>
              <button type="button" id="speakersDropdownButton" data-dropdown-toggle="speakersDropdown" className="flex items-center pr-5 text-sm font-medium text-muted hover:underline dark:text-gray-400">
                <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 6.037c0-1.724-1.978-2.665-3.28-1.562L5.638 7.933H4c-1.105 0-2 .91-2 2.034v4.066c0 1.123.895 2.034 2 2.034h1.638l4.082 3.458c1.302 1.104 3.28.162 3.28-1.562V6.037Z" />
                  <path fillRule="evenodd" d="M14.786 7.658a.988.988 0 0 1 1.414-.014A6.135 6.135 0 0 1 18 12c0 1.662-.655 3.17-1.715 4.27a.989.989 0 0 1-1.414.014 1.029 1.029 0 0 1-.014-1.437A4.085 4.085 0 0 0 16 12a4.085 4.085 0 0 0-1.2-2.904 1.029 1.029 0 0 1-.014-1.438Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M17.657 4.811a.988.988 0 0 1 1.414 0A10.224 10.224 0 0 1 22 12c0 2.807-1.12 5.35-2.929 7.189a.988.988 0 0 1-1.414 0 1.029 1.029 0 0 1 0-1.438A8.173 8.173 0 0 0 20 12a8.173 8.173 0 0 0-2.343-5.751 1.029 1.029 0 0 1 0-1.438Z" clipRule="evenodd" />
                </svg>
                <span className="max-w-[12rem] truncate">{speakers[selectedSpeaker]?.label}</span>
                <svg className="ms-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                </svg>
              </button>
              <div id="speakersDropdown" className="z-10 hidden w-80 rounded-lg bg-white shadow-sm dark:bg-gray-700">
                <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="speakersDropdownButton">
                  {speakers.map((s, i) => (
                    <li key={s.deviceId || i}>
                      <button
                        type="button"
                        onClick={() => setSelectedSpeaker(i)}
                        title={t("lobby.selectSpeaker")}
                        className={
                          i === selectedSpeaker
                            ? "inline-flex w-full items-center rounded-md px-3 py-2 text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-600"
                            : "inline-flex w-full items-center rounded-md px-3 py-2 ps-[38px] hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                        }
                      >
                        {i === selectedSpeaker && (
                          <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                          </svg>
                        )}
                        <span className="truncate text-start">{s.label}</span>
                      </button>
                    </li>
                  ))}
                  <li className="mt-2 flex items-center space-x-2 border-t border-gray-200 pb-1 pt-3 dark:border-gray-600">
                    <button type="button" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg className="me-1.5 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 6.037c0-1.724-1.978-2.665-3.28-1.562L5.638 7.933H4c-1.105 0-2 .91-2 2.034v4.066c0 1.123.895 2.034 2 2.034h1.638l4.082 3.458c1.302 1.104 3.28.162 3.28-1.562V6.037Z" />
                        <path fillRule="evenodd" d="M14.786 7.658a.988.988 0 0 1 1.414-.014A6.135 6.135 0 0 1 18 12c0 1.662-.655 3.17-1.715 4.27a.989.989 0 0 1-1.414.014 1.029 1.029 0 0 1-.014-1.437A4.085 4.085 0 0 0 16 12a4.085 4.085 0 0 0-1.2-2.904 1.029 1.029 0 0 1-.014-1.438Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M17.657 4.811a.988.988 0 0 1 1.414 0A10.224 10.224 0 0 1 22 12c0 2.807-1.12 5.35-2.929 7.189a.988.988 0 0 1-1.414 0 1.029 1.029 0 0 1 0-1.438A8.173 8.173 0 0 0 20 12a8.173 8.173 0 0 0-2.343-5.751 1.029 1.029 0 0 1 0-1.438Z" clipRule="evenodd" />
                      </svg>
                      {t("lobby.testSpeakers")}
                    </button>
                  </li>
                </ul>
              </div>
              <button type="button" id="cameraDropdownButton" data-dropdown-toggle="cameraDropdown" className="flex items-center pr-5 text-sm font-medium text-muted hover:underline dark:text-gray-400">
                <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M14 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7Zm2 9.387 4.684 1.562A1 1 0 0 0 22 17V7a1 1 0 0 0-1.316-.949L16 7.613v8.774Z" clipRule="evenodd" />
                </svg>
                <span className="max-w-[12rem] truncate">{cameras[selectedCamera]?.label}</span>
                <svg className="ms-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                </svg>
              </button>
              <div id="cameraDropdown" className="z-10 hidden w-80 rounded-lg bg-white shadow-sm dark:bg-gray-700">
                <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="cameraDropdownButton">
                  {cameras.map((c, i) => (
                    <li key={c.deviceId || i}>
                      <button
                        type="button"
                        onClick={() => setSelectedCamera(i)}
                        title={t("lobby.selectCamera")}
                        className={
                          i === selectedCamera
                            ? "inline-flex w-full items-center rounded-md px-3 py-2 text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-600"
                            : "inline-flex w-full items-center rounded-md px-3 py-2 ps-[38px] hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                        }
                      >
                        {i === selectedCamera && (
                          <svg className="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                          </svg>
                        )}
                        <span className="truncate text-start">{c.label}</span>
                      </button>
                    </li>
                  ))}
                  <li className="mt-2 flex items-center space-x-2 border-t border-gray-200 pb-1 pt-3 dark:border-gray-600">
                    <button type="button" onClick={() => setCameraOn((v) => !v)} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg className="me-1.5 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M14 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7Zm2 9.387 4.684 1.562A1 1 0 0 0 22 17V7a1 1 0 0 0-1.316-.949L16 7.613v8.774Z" clipRule="evenodd" />
                      </svg>
                      {t("lobby.testCamera")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sorun bildir modalı --- */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4 motion-safe:animate-[tl-fade_var(--dur-modal)_var(--ease-out)]">
          <div className="relative max-h-full w-full max-w-lg motion-safe:animate-[tl-modal-in_var(--dur-modal)_var(--ease-out)]">
            <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
              <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-600 md:p-5">
                <h3 className="text-base font-semibold text-ink dark:text-white">{t("lobby.report.title")}</h3>
                <button type="button" onClick={() => setReportOpen(false)} className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("lobby.report.close")}</span>
                </button>
              </div>
              {submitted ? (
                <div className="space-y-4 p-4 text-center md:p-5">
                  <svg className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                  </svg>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{t("lobby.report.success")}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("lobby.report.successNote")}</p>
                  <button type="button" onClick={() => setReportOpen(false)} className="w-full rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    {t("lobby.report.close")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4 md:p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("lobby.report.description")}</p>
                  <div>
                    <label htmlFor="report-text" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("lobby.report.label")}</label>
                    <textarea
                      id="report-text"
                      rows={4}
                      value={reportText}
                      onChange={(e) => {
                        setReportText(e.target.value);
                        if (reportError) setReportError(false);
                      }}
                      placeholder={t("lobby.report.placeholder")}
                      className={
                        "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 " +
                        (reportError
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600")
                      }
                    />
                    {reportError && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{t("lobby.report.emptyError")}</p>}
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted">{t("lobby.report.diagnostics")}</span>
                      <button type="button" onClick={copyReport} className="text-xs font-medium text-primary-700 hover:underline dark:text-primary-500">
                        {copied ? t("lobby.report.copied") : t("lobby.report.copy")}
                      </button>
                    </div>
                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{buildDiagnostics()}</pre>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={submitReport} className="flex-1 rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                      {t("lobby.report.submit")}
                    </button>
                    <button type="button" onClick={() => setReportOpen(false)} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                      {t("lobby.report.cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Sorun giderme / tanılama modalı --- */}
      {diagOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4 motion-safe:animate-[tl-fade_var(--dur-modal)_var(--ease-out)]">
          <div className="relative max-h-full w-full max-w-lg motion-safe:animate-[tl-modal-in_var(--dur-modal)_var(--ease-out)]">
            <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
              <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-600 md:p-5">
                <h3 className="text-base font-semibold text-ink dark:text-white">{t("lobby.diag.title")}</h3>
                <button type="button" onClick={() => setDiagOpen(false)} className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("lobby.diag.close")}</span>
                </button>
              </div>
              <div className="space-y-4 p-4 md:p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("lobby.diag.subtitle")}</p>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-600 dark:border-gray-600">
                  {diagRows.map((row) => (
                    <li key={row.label} className="flex items-center gap-2 px-3 py-2.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.label}</span>
                      <span className={toneBadge(row.info.tone)} title={row.info.label}>
                        <span className="block max-w-[12rem] truncate">{row.info.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">{t("lobby.diag.tip")}</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={rescan} disabled={scanning} className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    {scanning ? t("lobby.diag.scanning") : t("lobby.diag.rescan")}
                  </button>
                  <button type="button" onClick={() => setDiagOpen(false)} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                    {t("lobby.diag.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
