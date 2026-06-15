export type MeetingPhase = "idle" | "prejoin" | "in";
export type MeetingLayout = "grid" | "speaker";
export type ParticipantRole = "host" | "cohost" | "attendee" | "viewer";
export type SidePanelTab = "none" | "participants" | "chat" | "captions" | "host" | "engage";
export type CaptionLang = "en" | "tr";
export type ConnectionQuality = "good" | "fair" | "poor";
export type AccessTier = "open" | "trusted" | "restricted";
export type ResolutionLevel = "auto" | "fhd" | "hd" | "sd" | "audio";
export type BandwidthPolicy = "auto" | "limited" | "audio";
export type NotesRecipients = "all" | "inorg" | "hosts";

export interface MeetingNotes { summary: string; decisions: string[]; nextSteps: string[] }
export interface RemoteControl { presenterId: string; controllerId: string | null }
export interface MeetingPoll { question: string; options: { id: string; text: string; votes: string[] }[]; closed?: boolean }
export interface QnaItem { id: string; authorId: string; text: string; upvotes: string[]; answered?: boolean }
export interface Participant {
  id: string; name: string; role: ParticipantRole;
  micOn: boolean; camOn: boolean; handRaised: boolean;
  isSelf?: boolean; screenSharing?: boolean; quality?: ConnectionQuality;
}
export interface VideoRoom { id: string; name: string; createdBy: string; locked?: boolean; waitingRoom?: boolean; password?: string; participants?: number }
export interface LobbyEntry { id: string; name: string }
export interface MeetingSummary { id: string; title: string; host: string; startsInMin: number; participantIds: string[]; live?: boolean }
export interface CaptionLine { speakerId: string; en: string; tr: string }
export interface Caption { id: string; speaker: string; text: string }
export interface MeetingChat { id: string; authorId: string; body: string; tMin: number }
export interface Breakout { id: string; name: string; participantIds: string[] }
export interface FloatingReaction { id: string; emoji: string }

export const MEETING_REACTIONS = ["👍", "👏", "🎉", "❤️", "😂", "✋"];
