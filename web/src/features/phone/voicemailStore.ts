import { createStore, useStore } from "@/lib/createStore";
import { VOICEMAILS } from "./data";
import type { Voicemail } from "./phone.types";

/** Varsayılan sesli mesaj karşılaması (mock; UI'da düzenlenebilir). */
const DEFAULT_GREETING =
  "Merhaba, Aura Labs'a ulaştınız. Şu an müsait değiliz; lütfen sinyal sesinden sonra mesaj bırakın.";

export interface VoicemailState {
  voicemails: Voicemail[];
  greeting: string;
  markHeard: (id: string) => void;
  setGreeting: (text: string) => void;
  resetStore: () => void;
}

const seed = () => ({
  voicemails: VOICEMAILS.map((v) => ({ ...v })),
  greeting: DEFAULT_GREETING,
});

export const voicemailStore = createStore<VoicemailState>((set) => ({
  ...seed(),

  markHeard: (id) =>
    set((s) =>
      s.voicemails.some((v) => v.id === id && !v.heard)
        ? { voicemails: s.voicemails.map((v) => (v.id === id ? { ...v, heard: true } : v)) }
        : {},
    ),

  setGreeting: (text) => set({ greeting: text }),

  resetStore: () => set(seed()),
}));

/** React bağlama: voicemail store diliminden seçim. */
export const useVoicemail = <U,>(selector: (s: VoicemailState) => U): U =>
  useStore(voicemailStore, selector);
