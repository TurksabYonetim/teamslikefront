import { createStore, useStore } from "@/lib/createStore";
import type { Story } from "./types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const SEED: Story[] = [
  { id: "st_1", authorId: "usr_2", kind: "text", text: "Yeni sürüm yayında! 🚀", seenBy: [], tMinutes: 40 },
  { id: "st_2", authorId: "usr_3", kind: "image", text: "Ofisten manzara", mediaName: "view.jpg", seenBy: ["usr_1"], tMinutes: 120 },
  { id: "st_3", authorId: "usr_4", kind: "text", text: "Kahve molası ☕", seenBy: [], tMinutes: 200 },
];
const clone = (): Story[] => SEED.map((s) => ({ ...s, seenBy: [...s.seenBy] }));

interface StoriesState {
  stories: Story[];
  addStory: (authorId: string, text: string) => void;
  markSeen: (id: string, userId: string) => void;
  reset: () => void;
}

export const storiesStore = createStore<StoriesState>((set) => ({
  stories: clone(),
  addStory: (authorId, text) =>
    set((s) => ({
      stories: [{ id: uid(), authorId, kind: "text", text, seenBy: [], tMinutes: 0 }, ...s.stories],
    })),
  markSeen: (id, userId) =>
    set((s) => ({
      stories: s.stories.map((st) =>
        st.id === id && !st.seenBy.includes(userId) ? { ...st, seenBy: [...st.seenBy, userId] } : st,
      ),
    })),
  reset: () => set({ stories: clone() }),
}));

export const useStories = <U,>(selector: (s: StoriesState) => U): U => useStore(storiesStore, selector);

export const unseenFor = (stories: Story[], userId: string): Story[] =>
  stories.filter((s) => s.authorId !== userId && !s.seenBy.includes(userId));
