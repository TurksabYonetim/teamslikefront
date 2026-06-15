// web/src/features/meetings/meetings.data.ts
import type { Participant, VideoRoom, LobbyEntry, MeetingSummary, CaptionLine, MeetingChat, QnaItem } from "./meetings.store.types";

export const MEETINGS: MeetingSummary[] = [
  { id: "mtg_standup", title: "Daily Standup", host: "usr_1", startsInMin: 0, participantIds: ["usr_1", "usr_2", "usr_3"], live: true },
  { id: "mtg_launch", title: "Q3 Launch Review", host: "usr_2", startsInMin: 15, participantIds: ["usr_1", "usr_2", "usr_4"] },
  { id: "mtg_design", title: "Design Critique", host: "usr_4", startsInMin: 60, participantIds: ["usr_2", "usr_4", "usr_6"] },
];

export const ROOM_PARTICIPANTS: Participant[] = [
  { id: "usr_1", name: "Siz", role: "host", micOn: true, camOn: true, handRaised: false, isSelf: true, quality: "good" },
  { id: "usr_2", name: "Defne Yıldız", role: "cohost", micOn: true, camOn: true, handRaised: false, quality: "good" },
  { id: "usr_3", name: "Marco Rossi", role: "attendee", micOn: false, camOn: true, handRaised: true, quality: "fair" },
  { id: "usr_4", name: "Priya N.", role: "attendee", micOn: true, camOn: false, handRaised: false, quality: "good" },
  { id: "usr_6", name: "Aylin Kaya", role: "attendee", micOn: false, camOn: false, handRaised: false, quality: "poor" },
];

export const ROOMS: VideoRoom[] = [
  { id: "room_war", name: "War Room", createdBy: "usr_1", participants: 3 },
  { id: "room_design", name: "Design Studio", createdBy: "usr_2", locked: true, waitingRoom: true, participants: 2 },
  { id: "room_allhands", name: "All Hands", createdBy: "usr_1", participants: 0 },
];

export const LOBBY_SEED: LobbyEntry[] = [{ id: "usr_5", name: "Jordan Blake" }];

export const CAPTION_SCRIPT: CaptionLine[] = [
  { speakerId: "usr_2", en: "Let's review the Q3 launch plan.", tr: "Q3 lansman planını gözden geçirelim." },
  { speakerId: "usr_1", en: "I'll share the pricing page update.", tr: "Fiyatlandırma sayfası güncellemesini paylaşacağım." },
  { speakerId: "usr_3", en: "We decided to ship on Friday.", tr: "Cuma günü yayınlamaya karar verdik." },
  { speakerId: "usr_4", en: "Action item: email the design specs.", tr: "Aksiyon: tasarım dökümanlarını e-postayla gönder." },
  { speakerId: "usr_2", en: "Next steps look good to me.", tr: "Sonraki adımlar bana iyi görünüyor." },
  { speakerId: "usr_6", en: "I agree with the proposal.", tr: "Teklife katılıyorum." },
];

export const MEETING_CHAT_SEED: MeetingChat[] = [
  { id: "mc1", authorId: "usr_2", body: "Bağlantıyı paylaşır mısın?", tMin: 3 },
  { id: "mc2", authorId: "usr_1", body: "Tabii, sabitliyorum.", tMin: 2 },
  { id: "mc3", authorId: "usr_3", body: "👍", tMin: 1 },
];

export const QNA_SEED: QnaItem[] = [
  { id: "q1", authorId: "usr_3", text: "Fiyatlandırma ne zaman yayında olacak?", upvotes: ["usr_4", "usr_6"] },
  { id: "q2", authorId: "usr_4", text: "Kayıt paylaşılacak mı?", upvotes: ["usr_2"] },
];
