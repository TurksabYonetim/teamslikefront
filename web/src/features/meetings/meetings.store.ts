// web/src/features/meetings/meetings.store.ts
import { createStore, useStore } from "@/lib/createStore";
import { ME_ID } from "@/features/messaging/members";
import { messagingStore } from "@/features/messaging/store";
import {
  MEETINGS,
  ROOM_PARTICIPANTS,
  ROOMS,
  LOBBY_SEED,
  CAPTION_SCRIPT,
  MEETING_CHAT_SEED,
  QNA_SEED,
} from "./meetings.data";
import { buildMeetingNotes, togglePinList } from "./meetGm";
import type {
  AccessTier,
  BandwidthPolicy,
  Breakout,
  Caption,
  CaptionLang,
  FloatingReaction,
  LobbyEntry,
  MeetingChat,
  MeetingLayout,
  MeetingNotes,
  MeetingPhase,
  MeetingPoll,
  NotesRecipients,
  Participant,
  QnaItem,
  RemoteControl,
  ResolutionLevel,
  SidePanelTab,
  VideoRoom,
} from "./meetings.store.types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/** Floating reaction buffer is capped so a reaction spam never unbounds memory/DOM. */
const REACTION_CAP = 50;

export interface MeetingState {
  phase: MeetingPhase;
  activeMeetingId: string | null;
  activeTitle: string;
  linkedChannelId: string | null;
  linkedTopicId: string | null;
  // moderatör
  rooms: VideoRoom[]; locked: boolean; waitingRoom: boolean;
  allowAttendeeShare: boolean; allowAttendeeChat: boolean;
  spotlightId: string | null; meetingPoll: MeetingPoll | null; qna: QnaItem[]; whiteboardOpen: boolean;
  // self medya
  micOn: boolean; camOn: boolean; screenSharing: boolean; handRaised: boolean; blurOn: boolean; aiCompanion: boolean;
  // meet parite
  companionMode: boolean; noiseCancellation: boolean; breakoutEndsAt: number | null;
  meetFx: Record<string, boolean>;
  // granül moderasyon
  audioLock: boolean; videoLock: boolean; accessTier: AccessTier; requireConsent: boolean;
  pinnedIds: string[]; annotateOn: boolean; remoteControl: RemoteControl | null;
  // AI not
  meetingNotes: MeetingNotes | null; noteSections: Record<string, boolean>; notesRecipients: NotesRecipients;
  // çeviri
  speechTranslation: boolean; speechFrom: string; speechTo: string;
  // kalite
  sendResolution: ResolutionLevel; receiveResolution: ResolutionLevel; bandwidthPolicy: BandwidthPolicy; dataSaver: boolean;
  // layout/ui
  layout: MeetingLayout; sidePanel: SidePanelTab; recording: boolean; recordSec: number; captionsOn: boolean; captionLang: CaptionLang;
  // katılımcılar/akış
  participants: Participant[]; activeSpeakerId: string | null; lobbyQueue: LobbyEntry[];
  captions: Caption[]; captionIndex: number; reactions: FloatingReaction[]; breakouts: Breakout[]; chat: MeetingChat[];

  // --- actions ---
  toggleMic: () => void; toggleCam: () => void; toggleScreen: () => void; toggleHand: () => void;
  setLayout: (l: MeetingLayout) => void; setSidePanel: (t: SidePanelTab) => void;
  toggleRecording: () => void; toggleCaptions: () => void; setCaptionLang: (l: CaptionLang) => void;
  admit: (id: string) => void; denyLobby: (id: string) => void;
  sendReaction: (emoji: string) => void; sendChat: (body: string) => void;
  postToLinkedChannel: (body: string) => void;
  toggleSpotlight: (id: string) => void; togglePin: (id: string) => void;
  muteAll: () => void; lowerAllHands: () => void; toggleParticipantMute: (id: string) => void;
  createBreakouts: (count: number) => void; closeBreakouts: () => void;
  launchPoll: (q: string, opts: string[]) => void; votePoll: (optId: string) => void; closeMeetingPoll: () => void;
  askQuestion: (text: string) => void; upvoteQuestion: (id: string) => void; answerQuestion: (id: string) => void;
  generateNotes: () => void; toggleNoteSection: (k: string) => void; setNotesRecipients: (r: NotesRecipients) => void;
  // simülasyon
  pushCaption: () => void; rotateSpeaker: () => void; tickRecord: () => void;
  // faz
  openPrejoin: (id: string, title: string) => void; startInstant: () => void; join: () => void; leave: () => void;
  startFromChannel: (channelId: string, topicId: string, title: string) => void;
  // persistent rooms
  createRoom: (name: string, opts: { locked?: boolean; waitingRoom?: boolean; password?: string }) => void;
  deleteRoom: (id: string) => void; joinRoom: (id: string) => void;
  // moderatör aksiyonları
  makeCoHost: (id: string) => void; removeParticipant: (id: string) => void;
  toggleLock: () => void; toggleWaitingRoom: () => void;
  toggleAttendeeShare: () => void; toggleAttendeeChat: () => void; endForAll: () => void;
  // granül moderasyon
  toggleAudioLock: () => void; toggleVideoLock: () => void; setAccessTier: (tier: AccessTier) => void;
  makeViewer: (id: string) => void; sendToWaitingRoom: (id: string) => void; toggleRequireConsent: () => void;
  toggleAnnotate: () => void;
  // remote control
  requestRemoteControl: (presenterId: string) => void; grantRemoteControl: (controllerId: string) => void; stopRemoteControl: () => void;
  // çeviri
  toggleSpeechTranslation: () => void; setSpeechPair: (from: string, to: string) => void;
  // kalite
  setSendResolution: (r: ResolutionLevel) => void; setReceiveResolution: (r: ResolutionLevel) => void;
  setBandwidthPolicy: (p: BandwidthPolicy) => void; toggleDataSaver: () => void;
  // engage / efektler
  toggleWhiteboard: () => void; toggleBlur: () => void; toggleAiCompanion: () => void;
  toggleCompanion: () => void; toggleNoiseCancellation: () => void;
  startBreakoutTimer: (minutes: number) => void; clearBreakoutTimer: () => void;
  toggleMeetFx: (key: string) => void; toggleParticipantHand: (id: string) => void;
  // test
  resetStore: () => void;
}

const seed = () => ({
  phase: "in" as MeetingPhase, activeMeetingId: MEETINGS[0].id, activeTitle: MEETINGS[0].title,
  linkedChannelId: null, linkedTopicId: null,
  rooms: ROOMS.map((r) => ({ ...r })), locked: false, waitingRoom: true,
  allowAttendeeShare: true, allowAttendeeChat: true, spotlightId: null, meetingPoll: null,
  qna: QNA_SEED.map((q) => ({ ...q, upvotes: [...q.upvotes] })), whiteboardOpen: false,
  micOn: true, camOn: true, screenSharing: false, handRaised: false, blurOn: false, aiCompanion: true,
  companionMode: false, noiseCancellation: true, breakoutEndsAt: null, meetFx: {} as Record<string, boolean>,
  audioLock: false, videoLock: false, accessTier: "trusted" as AccessTier, requireConsent: false,
  pinnedIds: [] as string[], annotateOn: false, remoteControl: null,
  meetingNotes: null, noteSections: { summary: true, decisions: true, nextSteps: true } as Record<string, boolean>, notesRecipients: "all" as NotesRecipients,
  speechTranslation: false, speechFrom: "en", speechTo: "tr",
  sendResolution: "auto" as ResolutionLevel, receiveResolution: "auto" as ResolutionLevel, bandwidthPolicy: "auto" as BandwidthPolicy, dataSaver: false,
  layout: "grid" as MeetingLayout, sidePanel: "none" as SidePanelTab, recording: false, recordSec: 0, captionsOn: false, captionLang: "en" as CaptionLang,
  participants: ROOM_PARTICIPANTS.map((p) => ({ ...p })), activeSpeakerId: ROOM_PARTICIPANTS[1].id, lobbyQueue: LOBBY_SEED.map((l) => ({ ...l })),
  captions: [] as Caption[], captionIndex: 0, reactions: [] as FloatingReaction[], breakouts: [] as Breakout[], chat: MEETING_CHAT_SEED.map((c) => ({ ...c })),
});

export const meetingStore = createStore<MeetingState>((set, get) => {
  const patchP = (id: string, fn: (p: Participant) => Participant) =>
    set((s) => ({ participants: s.participants.map((p) => (p.id === id ? fn(p) : p)) }));
  return {
    ...seed(),
    toggleMic: () =>
      set((s) => ({
        micOn: !s.micOn,
        participants: s.participants.map((p) => (p.isSelf ? { ...p, micOn: !s.micOn } : p)),
      })),
    toggleCam: () =>
      set((s) => ({
        camOn: !s.camOn,
        participants: s.participants.map((p) => (p.isSelf ? { ...p, camOn: !s.camOn } : p)),
      })),
    toggleScreen: () =>
      set((s) => ({
        screenSharing: !s.screenSharing,
        layout: !s.screenSharing ? "speaker" : s.layout,
        participants: s.participants.map((p) => (p.isSelf ? { ...p, screenSharing: !s.screenSharing } : p)),
      })),
    toggleHand: () =>
      set((s) => ({
        handRaised: !s.handRaised,
        participants: s.participants.map((p) => (p.isSelf ? { ...p, handRaised: !s.handRaised } : p)),
      })),
    setLayout: (layout) => set({ layout }),
    setSidePanel: (t) => set((s) => ({ sidePanel: s.sidePanel === t ? "none" : t })),
    toggleRecording: () => set((s) => ({ recording: !s.recording, recordSec: s.recording ? 0 : s.recordSec })),
    toggleCaptions: () => set((s) => ({ captionsOn: !s.captionsOn })),
    setCaptionLang: (captionLang) => set({ captionLang }),
    admit: (id) =>
      set((s) => {
        const e = s.lobbyQueue.find((l) => l.id === id);
        if (!e) return {};
        return {
          lobbyQueue: s.lobbyQueue.filter((l) => l.id !== id),
          participants: [...s.participants, { id: e.id, name: e.name, role: "attendee", micOn: false, camOn: false, handRaised: false, quality: "good" } as Participant],
        };
      }),
    denyLobby: (id) => set((s) => ({ lobbyQueue: s.lobbyQueue.filter((l) => l.id !== id) })),
    sendReaction: (emoji) => {
      const id = uid();
      // Keep at most REACTION_CAP floating reactions; drop the oldest on overflow.
      set((s) => ({ reactions: [...s.reactions, { id, emoji }].slice(-REACTION_CAP) }));
      setTimeout(() => set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })), 2600);
    },
    sendChat: (body) => {
      if (!body.trim()) return;
      set((s) => ({ chat: [...s.chat, { id: uid(), authorId: ME_ID, body, tMin: 0 }] }));
    },
    // Meeting↔kanal köprüsü: bağlı kanal/topic varsa mesajı oraya yaz, yoksa no-op.
    postToLinkedChannel: (body) => {
      if (!body.trim()) return;
      const { linkedChannelId, linkedTopicId } = get();
      if (!linkedChannelId || !linkedTopicId) return;
      messagingStore.getState().postExternal(linkedChannelId, linkedTopicId, body, ME_ID);
    },
    toggleSpotlight: (id) =>
      set((s) => ({ spotlightId: s.spotlightId === id ? null : id, layout: s.spotlightId === id ? s.layout : "speaker" })),
    togglePin: (id) => set((s) => ({ pinnedIds: togglePinList(s.pinnedIds, id) })),
    muteAll: () => set((s) => ({ participants: s.participants.map((p) => (p.isSelf ? p : { ...p, micOn: false })) })),
    lowerAllHands: () => set((s) => ({ participants: s.participants.map((p) => ({ ...p, handRaised: false })) })),
    toggleParticipantMute: (id) => patchP(id, (p) => ({ ...p, micOn: !p.micOn })),
    createBreakouts: (count) =>
      set((s) => {
        const ids = s.participants.map((p) => p.id);
        const rooms: Breakout[] = Array.from({ length: count }, (_, i) => ({ id: `bo_${i}`, name: `Room ${i + 1}`, participantIds: [] }));
        ids.forEach((pid, i) => rooms[i % count].participantIds.push(pid));
        return { breakouts: rooms };
      }),
    closeBreakouts: () => set({ breakouts: [] }),
    launchPoll: (question, opts) =>
      set({ meetingPoll: { question, options: opts.filter((o) => o.trim()).map((text, i) => ({ id: `o${i}`, text, votes: [] })) } }),
    votePoll: (optId) =>
      set((s) => {
        if (!s.meetingPoll || s.meetingPoll.closed) return {};
        return {
          meetingPoll: {
            ...s.meetingPoll,
            options: s.meetingPoll.options.map((o) =>
              o.id === optId
                ? { ...o, votes: o.votes.includes(ME_ID) ? o.votes.filter((u) => u !== ME_ID) : [...o.votes, ME_ID] }
                : { ...o, votes: o.votes.filter((u) => u !== ME_ID) },
            ),
          },
        };
      }),
    closeMeetingPoll: () => set((s) => (s.meetingPoll ? { meetingPoll: { ...s.meetingPoll, closed: true } } : {})),
    askQuestion: (text) => {
      if (!text.trim()) return;
      set((s) => ({ qna: [...s.qna, { id: uid(), authorId: ME_ID, text, upvotes: [] }] }));
    },
    upvoteQuestion: (id) =>
      set((s) => ({
        qna: s.qna.map((q) =>
          q.id === id
            ? { ...q, upvotes: q.upvotes.includes(ME_ID) ? q.upvotes.filter((u) => u !== ME_ID) : [...q.upvotes, ME_ID] }
            : q,
        ),
      })),
    answerQuestion: (id) => set((s) => ({ qna: s.qna.map((q) => (q.id === id ? { ...q, answered: true } : q)) })),
    generateNotes: () => set((s) => ({ meetingNotes: buildMeetingNotes(s.captions) })),
    toggleNoteSection: (k) => set((s) => ({ noteSections: { ...s.noteSections, [k]: !s.noteSections[k] } })),
    setNotesRecipients: (notesRecipients) => set({ notesRecipients }),
    pushCaption: () =>
      set((s) => {
        const line = CAPTION_SCRIPT[s.captionIndex % CAPTION_SCRIPT.length];
        const speaker = s.participants.find((p) => p.id === line.speakerId)?.name ?? line.speakerId;
        return {
          captions: [...s.captions, { id: uid(), speaker, text: s.captionLang === "tr" ? line.tr : line.en }].slice(-6),
          captionIndex: s.captionIndex + 1,
        };
      }),
    rotateSpeaker: () =>
      set((s) => {
        const others = s.participants.filter((p) => !p.isSelf);
        if (!others.length) return {};
        const i = others.findIndex((p) => p.id === s.activeSpeakerId);
        return { activeSpeakerId: others[(i + 1) % others.length].id };
      }),
    tickRecord: () => set((s) => (s.recording ? { recordSec: s.recordSec + 1 } : {})),
    openPrejoin: (activeMeetingId, activeTitle) => set({ phase: "prejoin", activeMeetingId, activeTitle }),
    startInstant: () => set({ phase: "in" }),
    join: () => set({ phase: "in" }),
    leave: () => set({ phase: "idle", sidePanel: "none", recording: false, screenSharing: false }),
    startFromChannel: (channelId, topicId, title) =>
      set({
        phase: "prejoin",
        activeMeetingId: `mtg_${channelId}`,
        activeTitle: title,
        linkedChannelId: channelId,
        linkedTopicId: topicId,
      }),
    resetStore: () => set(() => seed()),

    // --- persistent rooms ---
    createRoom: (name, opts) =>
      set((s) => ({
        rooms: [
          { id: `room_${uid()}`, name, createdBy: ME_ID, locked: opts.locked, waitingRoom: opts.waitingRoom, password: opts.password, participants: 0 },
          ...s.rooms,
        ],
      })),
    deleteRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),
    joinRoom: (id) => {
      const room = get().rooms.find((r) => r.id === id);
      if (!room) return;
      set({
        phase: "prejoin",
        activeMeetingId: room.id,
        activeTitle: room.name,
        locked: !!room.locked,
        waitingRoom: !!room.waitingRoom,
        linkedChannelId: null,
        linkedTopicId: null,
      });
    },

    // --- moderatör aksiyonları ---
    makeCoHost: (id) => set((s) => ({ participants: s.participants.map((p) => (p.id === id ? { ...p, role: "cohost" } : p)) })),
    removeParticipant: (id) =>
      set((s) => ({
        participants: s.participants.filter((p) => p.id !== id),
        spotlightId: s.spotlightId === id ? null : s.spotlightId,
      })),
    toggleLock: () => set((s) => ({ locked: !s.locked })),
    toggleWaitingRoom: () => set((s) => ({ waitingRoom: !s.waitingRoom })),
    toggleAttendeeShare: () => set((s) => ({ allowAttendeeShare: !s.allowAttendeeShare })),
    toggleAttendeeChat: () => set((s) => ({ allowAttendeeChat: !s.allowAttendeeChat })),
    endForAll: () =>
      set({ phase: "idle", activeMeetingId: null, captionsOn: false, linkedChannelId: null, linkedTopicId: null, participants: [], spotlightId: null }),

    // --- granül moderasyon ---
    toggleAudioLock: () => set((s) => ({ audioLock: !s.audioLock })),
    toggleVideoLock: () => set((s) => ({ videoLock: !s.videoLock })),
    setAccessTier: (accessTier) => set({ accessTier }),
    makeViewer: (id) =>
      set((s) => ({
        participants: s.participants.map((p) => (p.id === id ? { ...p, role: "viewer", micOn: false, camOn: false } : p)),
      })),
    sendToWaitingRoom: (id) =>
      set((s) => {
        const p = s.participants.find((x) => x.id === id);
        if (!p) return {};
        return {
          participants: s.participants.filter((x) => x.id !== id),
          lobbyQueue: [...s.lobbyQueue, { id: p.id, name: p.name }],
        };
      }),
    toggleRequireConsent: () => set((s) => ({ requireConsent: !s.requireConsent })),
    toggleAnnotate: () => set((s) => ({ annotateOn: !s.annotateOn })),

    // --- remote control ---
    requestRemoteControl: (presenterId) => set({ remoteControl: { presenterId, controllerId: null } }),
    grantRemoteControl: (controllerId) =>
      set((s) => (s.remoteControl ? { remoteControl: { ...s.remoteControl, controllerId } } : {})),
    stopRemoteControl: () => set({ remoteControl: null }),

    // --- çeviri ---
    toggleSpeechTranslation: () => set((s) => ({ speechTranslation: !s.speechTranslation })),
    setSpeechPair: (speechFrom, speechTo) => set({ speechFrom, speechTo }),

    // --- kalite / bant genişliği ---
    setSendResolution: (sendResolution) => set({ sendResolution }),
    setReceiveResolution: (receiveResolution) => set({ receiveResolution }),
    setBandwidthPolicy: (bandwidthPolicy) => set({ bandwidthPolicy }),
    toggleDataSaver: () => set((s) => ({ dataSaver: !s.dataSaver })),

    // --- engage / efektler ---
    toggleWhiteboard: () => set((s) => ({ whiteboardOpen: !s.whiteboardOpen })),
    toggleBlur: () => set((s) => ({ blurOn: !s.blurOn })),
    toggleAiCompanion: () => set((s) => ({ aiCompanion: !s.aiCompanion })),
    toggleCompanion: () => set((s) => ({ companionMode: !s.companionMode })),
    toggleNoiseCancellation: () => set((s) => ({ noiseCancellation: !s.noiseCancellation })),
    startBreakoutTimer: (minutes) => set({ breakoutEndsAt: Date.now() + minutes * 60_000 }),
    clearBreakoutTimer: () => set({ breakoutEndsAt: null }),
    toggleMeetFx: (key) => set((s) => ({ meetFx: { ...s.meetFx, [key]: !s.meetFx[key] } })),
    toggleParticipantHand: (id) => patchP(id, (p) => ({ ...p, handRaised: !p.handRaised })),
  };
});

export const useMeeting = <U,>(selector: (s: MeetingState) => U): U => useStore(meetingStore, selector);
