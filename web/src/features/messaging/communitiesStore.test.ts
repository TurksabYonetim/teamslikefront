import { describe, it, expect, beforeEach } from "vitest";
import { communitiesStore } from "./communitiesStore";

const S = () => communitiesStore.getState();
beforeEach(() => S().reset());

describe("communitiesStore", () => {
  it("seeds communities and defaults to all (null)", () => {
    expect(S().communities.length).toBeGreaterThan(0);
    expect(S().activeCommunityId).toBeNull();
  });
  it("sets active community", () => {
    const id = S().communities[0].id;
    S().setActiveCommunity(id);
    expect(S().activeCommunityId).toBe(id);
    S().setActiveCommunity(null);
    expect(S().activeCommunityId).toBeNull();
  });
});
