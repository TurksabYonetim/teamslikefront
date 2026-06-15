// web/src/features/webinar/webinar.api.ts
// Frontend-only mock API katmanı — FastAPI sözleşmesinin taklidi.
// İmzalar gerçek backend (`/v1/webinar/...`) geldiğinde birebir korunabilir;
// bugünkü `EVENTS/REGISTRATIONS/...` mock data'sından beslenir, ağ gecikmesini
// `delay()` ile simüle eder. Store'lar bu katmanı çağırabilir (zorunlu değil).
import { EVENTS, REGISTRATIONS } from "./webinar.data";
import { nextApproval } from "./webinar.dom";
import type { AppEvent, Poll, QnaItem, Registration } from "./webinar.types";

/** Ağ gecikmesi simülasyonu — testlerde 0ms ile anında çözülür. */
export function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let seq = 0;
const regId = () => `rg_${Date.now()}_${seq++}`;
const pollId = () => `pl_${Date.now()}_${seq++}`;
const qnaId = () => `q_${Date.now()}_${seq++}`;

/** AppEvent derin kopyası — referans paylaşımıyla mock data'yı kirletmemek için. */
function cloneEvent(e: AppEvent): AppEvent {
  return {
    ...e,
    branding: { ...e.branding },
    registrationFields: e.registrationFields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })),
    sessions: e.sessions.map((s) => ({ ...s })),
  };
}

/**
 * GET /v1/webinar/events
 * Tüm etkinlikleri döndürür (klonlanmış — çağıran mutasyonu data'ya sızmaz).
 */
async function fetchEvents(): Promise<AppEvent[]> {
  await delay();
  return EVENTS.map(cloneEvent);
}

/**
 * GET /v1/webinar/events/{id}
 * Tek etkinlik; bulunamazsa `null` (404 taklidi).
 */
async function fetchEvent(id: string): Promise<AppEvent | null> {
  await delay();
  const found = EVENTS.find((e) => e.id === id);
  return found ? cloneEvent(found) : null;
}

/**
 * POST /v1/webinar/events/{id}/registrations
 * Onay durumu domain kuralıyla (`nextApproval`) belirlenir.
 */
async function submitRegistration(eventId: string, values: Record<string, string>): Promise<Registration> {
  await delay();
  const event = EVENTS.find((e) => e.id === eventId);
  const approval = event ? nextApproval(event, REGISTRATIONS) : "approved";
  return { id: regId(), eventId, values, status: "registered", approval };
}

/**
 * POST /v1/webinar/events/{id}/polls
 * Yeni anket "live" durumunda, boş oylarla döner.
 */
async function createPoll(eventId: string, question: string, options: string[]): Promise<Poll> {
  await delay();
  return {
    id: pollId(),
    eventId,
    question,
    state: "live",
    options: options.map((text, i) => ({ id: `o${i + 1}`, text, votes: [] })),
  };
}

/**
 * POST /v1/webinar/events/{id}/qna
 * Yeni soru yanıtlanmamış, oysuz döner.
 */
async function createQna(eventId: string, authorId: string, text: string): Promise<QnaItem> {
  await delay();
  return { id: qnaId(), eventId, authorId, text, upvotes: [], answered: false, tSec: 0 };
}

/**
 * POST /v1/webinar/qna/{id}/upvote
 * Oyu toggle eder (idempotent değil — tıklama davranışı). Saf: yeni kopya döner.
 */
async function upvoteQna(item: QnaItem, voterId: string): Promise<QnaItem> {
  await delay();
  const upvotes = item.upvotes.includes(voterId)
    ? item.upvotes.filter((v) => v !== voterId)
    : [...item.upvotes, voterId];
  return { ...item, upvotes };
}

export const webinarApi = {
  fetchEvents,
  fetchEvent,
  submitRegistration,
  createPoll,
  createQna,
  upvoteQna,
};
