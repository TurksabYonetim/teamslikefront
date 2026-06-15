/**
 * tl-api meeting `join_url`'ini Jitsi External API ile gömmek için yardımcılar.
 *
 * Backend gerçek bir join_url döndürür:
 *   https://meet.turksab.com/<room_name>?jwt=<HS256 imzalı Jitsi token>
 * JWT'yi backend imzalar (moderator veya guest). Frontend yalnızca görüşmeyi
 * başlatır: external_api.js yüklenir ve JitsiMeetExternalAPI örneği kurulur.
 */

export interface JitsiJoin {
  domain: string;
  room: string;
  jwt?: string;
}

/** `https://domain/room?jwt=...` → { domain, room, jwt }. */
export function parseJoinUrl(joinUrl: string): JitsiJoin | null {
  try {
    const u = new URL(joinUrl);
    const room = decodeURIComponent(u.pathname.replace(/^\//, ""));
    if (!room) return null;
    return { domain: u.host, room, jwt: u.searchParams.get("jwt") ?? undefined };
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiApi;
  }
}

export interface JitsiParticipant {
  participantId: string;
  displayName?: string;
  formattedDisplayName?: string;
  avatarURL?: string;
  role?: string;
}

export interface JitsiApi {
  dispose: () => void;
  addEventListener: (event: string, listener: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, listener: (...args: unknown[]) => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  /** Mevcut katılımcıların anlık listesi. */
  getParticipantsInfo: () => JitsiParticipant[];
  /** Yerel mikrofon mute durumu. */
  isAudioMuted: () => Promise<boolean>;
  /** Yerel kamera mute durumu. */
  isVideoMuted: () => Promise<boolean>;
}

const scriptCache = new Map<string, Promise<void>>();

/** `https://<domain>/external_api.js` script'ini bir kez yükler. */
export function loadJitsiScript(domain: string): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  const cached = scriptCache.get(domain);
  if (cached) return cached;

  const p = new Promise<void>((resolve, reject) => {
    const src = `https://${domain}/external_api.js`;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Jitsi script yüklenemedi")));
      if (window.JitsiMeetExternalAPI) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Jitsi script yüklenemedi"));
    document.body.appendChild(s);
  });
  scriptCache.set(domain, p);
  return p;
}

export interface StartJitsiOptions {
  joinUrl: string;
  container: HTMLElement;
  displayName?: string;
  email?: string;
  onReadyToClose?: () => void;
}

/**
 * join_url'i verilen container içine gömer. Çağıran, dönen api'yi
 * unmount sırasında `api.dispose()` ile temizlemelidir.
 */
export async function startJitsiMeeting({
  joinUrl,
  container,
  displayName,
  email,
  onReadyToClose,
}: StartJitsiOptions): Promise<JitsiApi> {
  const parsed = parseJoinUrl(joinUrl);
  if (!parsed) throw new Error("Geçersiz join_url");

  await loadJitsiScript(parsed.domain);
  if (!window.JitsiMeetExternalAPI) throw new Error("JitsiMeetExternalAPI yüklenemedi");

  const api = new window.JitsiMeetExternalAPI(parsed.domain, {
    roomName: parsed.room,
    jwt: parsed.jwt,
    parentNode: container,
    width: "100%",
    height: "100%",
    userInfo: displayName ? { displayName, email: email ?? "" } : undefined,
    // Jitsi'nin kendi araç çubuğu/chrome'u gizlenir; kontroller bizim UI'mızda.
    configOverwrite: {
      prejoinPageEnabled: false,
      toolbarButtons: [],
      disableShortcuts: true,
      disableReactions: true,
      hideConferenceSubject: true,
      hideConferenceTimer: true,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      HIDE_INVITE_MORE_HEADER: true,
      DISABLE_FOCUS_INDICATOR: true,
      DISABLE_VIDEO_BACKGROUND: false,
    },
  });

  if (onReadyToClose) api.addEventListener("readyToClose", onReadyToClose);
  return api;
}

/** Gömme yerine yeni sekmede açmak için. */
export function openJoinUrl(joinUrl: string): void {
  window.open(joinUrl, "_blank", "noopener,noreferrer");
}

/** Reaksiyon paletinde gösterilecek emojiler (Jitsi `sendReaction` argümanları). */
export const JITSI_REACTIONS = [
  { key: "thumbsUp", emoji: "👍" },
  { key: "clap", emoji: "👏" },
  { key: "laugh", emoji: "😂" },
  { key: "surprised", emoji: "😮" },
  { key: "heart", emoji: "❤️" },
  { key: "raiseHand", emoji: "✋" },
] as const;

/** Sanal arka plan seçenekleri. `none`/`blur` özel; diğerleri görsel URL'i. */
export interface BackgroundOption {
  id: string;
  /** i18n anahtarı (etiket için). */
  labelKey: string;
  kind: "none" | "blur" | "image";
  /** kind === "image" ise kullanılacak görsel URL'i. */
  url?: string;
}

export const JITSI_BACKGROUNDS: BackgroundOption[] = [
  { id: "none", labelKey: "room.backgroundNone", kind: "none" },
  { id: "blur", labelKey: "room.backgroundBlur", kind: "blur" },
];

/**
 * Jitsi JWT payload'ını imza DOĞRULAMADAN çözüp moderator olup olmadığını döner.
 * Yalnızca UI görünürlüğü içindir (yetki sunucuda zorlanır). Çözülemezse false.
 */
export function decodeJitsiModerator(joinUrl: string): boolean {
  const parsed = parseJoinUrl(joinUrl);
  const jwt = parsed?.jwt;
  if (!jwt) return false;
  try {
    const payloadPart = jwt.split(".")[1];
    if (!payloadPart) return false;
    const b64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    const claims = JSON.parse(json) as {
      moderator?: unknown;
      context?: { user?: { moderator?: unknown; affiliation?: unknown } };
    };
    const truthy = (v: unknown) => v === true || v === "true";
    return (
      truthy(claims.moderator) ||
      truthy(claims.context?.user?.moderator) ||
      claims.context?.user?.affiliation === "owner"
    );
  } catch {
    return false;
  }
}
