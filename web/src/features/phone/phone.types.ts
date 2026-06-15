/** Phone API tipleri — /v1/call-logs ve /v1/contacts sözleşmesine göre. */

export type CallDirection = "inbound" | "outbound" | "missed";

export interface CallLog {
  id: string;
  direction: CallDirection;
  peer_number: string;
  peer_name: string | null;
  duration_s: number;
  started_at: string;
  created_at: string;
}

export interface CreateCallLogRequest {
  direction: CallDirection;
  peer_number: string;
  peer_name?: string | null;
  duration_s?: number;
  started_at?: string | null;
}

export interface Contact {
  id: string;
  name: string;
  number: string;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateContactRequest {
  name: string;
  number: string;
  email?: string | null;
  notes?: string | null;
}

export interface UpdateContactRequest {
  name?: string;
  number?: string;
  email?: string | null;
  notes?: string | null;
}

/** Saniyeyi mm:ss biçimine çevirir. */
export function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ───────────────────────── Telephony domain (Faz 5) ─────────────────────────
 * Carrier-agnostic UCaaS domain. Live call state lives in createStore; persisted
 * history/contacts come from the real API (CallLog/Contact above). These domain
 * types model voicemail, SMS, PBX, IVR and the AI receptionist (frontend mock).
 */

/** Hafif rehber kaydı — saf mantık (caller-ID, spam, arama) bunun üzerinde çalışır.
 *  Gerçek `Contact{ name, number }` sınırda `{ name, e164: normalizeNumber(number) }`'a map'lenir. */
export interface PhoneContact {
  name: string;
  e164: string;
}

/** Çağrı yaşam döngüsü durum makinesi: ringing → active ⇄ hold → ended. */
export type CallState = "ringing" | "active" | "hold" | "ended";
/** Why a call ended. "voicemail" = caller was sent to voicemail and the call closed (distinct from RoutingActionKind's "voicemail"). */
export type CallEndReason = "completed" | "missed" | "declined" | "voicemail";

/** Canlı çağrı yönü (CallLog'un "missed"i bir endReason'dır, yön değil). */
export type LiveCallDirection = "inbound" | "outbound";

export interface Extension {
  id: string;
  number: string;
  label: string;
}

export interface Delegate {
  id: string;
  name: string;
  canAnswer: boolean;
  canPlaceOnBehalf: boolean;
}

export interface PhoneLine {
  id: string;
  e164: string;
  label: string;
  extensions: Extension[];
  delegates?: Delegate[];
}

export type RoutingCondition = "always" | "afterHours" | "busy" | "noAnswer";
export type RoutingActionKind = "forward" | "voicemail" | "ivr";

export interface RoutingRule {
  id: string;
  lineId: string;
  condition: RoutingCondition;
  action: RoutingActionKind;
  target?: string;
}

export interface Call {
  id: string;
  lineId: string;
  direction: LiveCallDirection;
  from: string;
  to: string;
  state: CallState;
  startedAt: number;
  durationSec: number;
  /** Persisted recording marker — set once a recording is stored (drives analytics "recorded" count). */
  recordingId?: string;
  endReason?: CallEndReason;
  participants?: string[];
  dtmf?: string;
  /** Live flag: is this call being recorded right now (toggled during the call). */
  recording?: boolean;
}

export interface Voicemail {
  id: string;
  lineId: string;
  from: string;
  receivedAt: number;
  durationSec: number;
  transcript?: string;
  heard: boolean;
}

export interface SmsMedia {
  kind: "image" | "file";
  name: string;
}

export interface SmsMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  body: string;
  sentAt: number;
  outbound: boolean;
  media?: SmsMedia[];
}

export interface SmsThread {
  id: string;
  contact: string; // display name (resolved caller-ID); the number is in `e164` below
  e164: string;
  messages: SmsMessage[];
  unread: number;
  participants?: string[];
}

export interface ScheduledSms {
  id: string;
  threadId: string;
  body: string;
  at: number;
}

export interface SmsTemplate {
  id: string;
  name: string;
  body: string;
}

export type Presence = "online" | "away" | "offline";

export type RingStrategy =
  | "simultaneous"
  | "round_robin"
  | "longest_idle"
  | "sequential"
  | "rotating"
  | "weighted";

export interface QueueAgent {
  id: string;
  name: string;
  idleSec: number;
  available: boolean;
  skills?: string[];
  weight?: number;
}

export interface QueuedCall {
  id: string;
  from: string;
  since: number;
  callbackRequested?: boolean;
}

export interface CallQueue {
  id: string;
  name: string;
  lineId: string;
  strategy: RingStrategy;
  agents: QueueAgent[];
  maxWaitSec: number;
  overflowAction: RoutingActionKind;
  overflowTarget?: string;
  waiting: QueuedCall[];
}

export interface HuntMember {
  id: string;
  name: string;
  available: boolean;
}

export interface HuntGroup {
  id: string;
  name: string;
  ring: "all" | "sequential";
  members: HuntMember[];
}

export type IVROptionAction = "menu" | "queue" | "voicemail" | "forward" | "extension";

export interface IVROption {
  key: string;
  label: string;
  action: IVROptionAction;
  target?: string;
}

export interface IVRMenu {
  id: string;
  name: string;
  greeting: string;
  options: IVROption[];
}

export interface HoursWindow {
  day: number; // 0=Sun … 6=Sat
  openMin: number;
  closeMin: number;
}

export interface BusinessHours {
  id: string;
  name: string;
  timezone: string;
  weekly: HoursWindow[];
  holidays: string[]; // ISO yyyy-mm-dd
}

export interface Recording {
  id: string;
  callId: string;
  startedAt: number;
  durationSec: number;
  consent: boolean;
  transcriptId?: string;
}

export type MonitorMode = "listen" | "whisper" | "barge" | "takeover";
export type CallOutcome = "resolved" | "follow_up" | "no_answer" | "sale" | "spam";

export interface Disposition {
  callId: string;
  outcome: CallOutcome;
  note: string;
  tags: string[];
}

export type CallerClass = "trusted" | "unknown" | "spam" | "blocked";

export type ReceptionistActionKind =
  | "route_queue"
  | "route_extension"
  | "answer_faq"
  | "book"
  | "voicemail"
  | "human";

export interface ReceptionistIntent {
  id: string;
  label: string;
  phrases: string[];
  action: ReceptionistActionKind;
  target?: string;
  answer?: string;
}

export type CaptureField = "name" | "phone" | "reason";

export interface ReceptionistConfig {
  id: string;
  enabled: boolean;
  greeting: string;
  afterHoursGreeting: string;
  hoursId: string;
  intents: ReceptionistIntent[];
  captureFields: CaptureField[];
  fallback: ReceptionistActionKind;
  smsFollowUp: boolean;
}

export interface ReceptionistTurn {
  id: string;
  who: "caller" | "ai";
  text: string;
}

export interface ReceptionistSession {
  turns: ReceptionistTurn[];
  detectedIntentId?: string;
  action?: ReceptionistActionKind;
  captured: { name?: string; phone?: string; reason?: string };
  done: boolean;
}

/** Tipli domain olayları = WS sözleşmesi (`call.*`) + sidecar olaylar. */
export type CallEvent =
  | { type: "call.placed"; call: Call }
  | { type: "call.answered"; callId: string }
  | { type: "call.ended"; callId: string; reason: CallEndReason }
  | { type: "call.routed"; callId: string; ruleId: string; action: RoutingActionKind }
  | { type: "voicemail.left"; voicemail: Voicemail }
  | { type: "sms.received"; message: SmsMessage };

export type CallEventType = CallEvent["type"];
