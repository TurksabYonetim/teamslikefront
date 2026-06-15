import { createStore, useStore } from "@/lib/createStore";
import type { Community } from "./types";

const SEED: Community[] = [
  { id: "cm_eng", name: "Engineering", channelIds: ["ch_eng", "ch_design", "ch_product"] },
  { id: "cm_company", name: "Company-wide", channelIds: ["ch_announce", "ch_product"] },
];
const clone = (): Community[] => SEED.map((c) => ({ ...c, channelIds: [...c.channelIds] }));

interface CommunitiesState {
  communities: Community[];
  activeCommunityId: string | null;
  setActiveCommunity: (id: string | null) => void;
  reset: () => void;
}

export const communitiesStore = createStore<CommunitiesState>((set) => ({
  communities: clone(),
  activeCommunityId: null,
  setActiveCommunity: (id) => set({ activeCommunityId: id }),
  reset: () => set({ communities: clone(), activeCommunityId: null }),
}));

export const useCommunities = <U,>(selector: (s: CommunitiesState) => U): U => useStore(communitiesStore, selector);
