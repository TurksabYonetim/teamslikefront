// web/src/features/webinar/webinar.types.ts
/**
 * Webinar & Events bounded context. Büyük ölçekli yayın (live / simulive /
 * evergreen / on-demand / townhall). Frontend-only mock; tipler WS sözleşmesini
 * de modeller (`WebinarEvent`).
 */

export type EventType = "live" | "simulive" | "evergreen" | "ondemand" | "townhall";

export type RegFieldType = "text" | "email" | "select";

export interface RegField {
  id: string;
  label: string;
  required: boolean;
  type: RegFieldType;
  options?: string[];
}

export interface EventBranding {
  accent: string; // hex
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  startsAt: number; // epoch ms
}

export interface AppEvent {
  id: string;
  title: string;
  type: EventType;
  startsAt: number;
  durationSec: number;
  capacity: number; // interactive seats
  viewOnlyCapacity?: number;
  requireApproval?: boolean;
  branding: EventBranding;
  registrationFields: RegField[];
  sessions: Session[];
}

export type RegistrationStatus = "registered" | "attended" | "no_show";
export type RegApproval = "approved" | "pending" | "rejected" | "waitlisted";

export interface Registration {
  id: string;
  eventId: string;
  values: Record<string, string>;
  status: RegistrationStatus;
  approval?: RegApproval;
  utm?: Record<string, string>;
}

export type PanelistRole = "host" | "panelist" | "moderator";

export interface Panelist {
  id: string;
  eventId: string;
  name: string;
  role: PanelistRole;
}

export type PollState = "draft" | "live" | "closed";

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface Poll {
  id: string;
  eventId: string;
  question: string;
  options: PollOption[];
  state: PollState;
}

export interface QnaItem {
  id: string;
  eventId: string;
  authorId: string;
  text: string;
  upvotes: string[];
  answered: boolean;
  tSec: number;
}

export interface EventCta {
  id: string;
  label: string;
  url: string;
}

export type WebinarEvent =
  | { type: "event.scheduled"; eventId: string }
  | { type: "registration.created"; registration: Registration }
  | { type: "attendee.joined"; eventId: string; attendeeId: string }
  | { type: "poll.launched"; poll: Poll }
  | { type: "qna.upvoted"; qnaId: string; voterId: string }
  | { type: "simulive.started"; eventId: string; at: number };

export interface TicketTier {
  id: string;
  name: string;
  currency: string; // ISO 4217
  price: number; // 0 = free
  quantity: number;
  sold: number;
}

export interface AgendaItem {
  id: string;
  day: string;
  track: string;
  start: string; // "09:00"
  end: string; // "09:45"
  title: string;
  speaker?: string;
}

export interface EventBadge {
  fields: string[];
  accent: string;
}
