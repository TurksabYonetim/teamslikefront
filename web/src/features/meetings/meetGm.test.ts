import { describe, it, expect } from "vitest";
import { togglePinList, accessTierDecision, effectiveCanUnmute, effectiveCanCam, resolutionProfile, buildMeetingNotes, MAX_PINS } from "./meetGm";

describe("meetGm", () => {
  it("togglePinList adds/removes and caps at MAX_PINS", () => {
    expect(togglePinList([], "a")).toEqual(["a"]);
    expect(togglePinList(["a"], "a")).toEqual([]);
    const full = Array.from({ length: MAX_PINS }, (_, i) => `p${i}`);
    expect(togglePinList(full, "new")).toEqual(full); // no-op when full
  });
  it("accessTierDecision per tier", () => {
    expect(accessTierDecision("open", { invited: false, trustedDomain: false })).toBe("admit");
    expect(accessTierDecision("trusted", { invited: false, trustedDomain: false })).toBe("knock");
    expect(accessTierDecision("trusted", { invited: true, trustedDomain: false })).toBe("admit");
    expect(accessTierDecision("restricted", { invited: false, trustedDomain: true })).toBe("deny");
  });
  it("locks: hosts bypass, viewers blocked", () => {
    expect(effectiveCanUnmute(true, "host")).toBe(true);
    expect(effectiveCanUnmute(true, "attendee")).toBe(false);
    expect(effectiveCanUnmute(false, "attendee")).toBe(true);
    expect(effectiveCanCam(false, "viewer")).toBe(false);
  });
  it("resolutionProfile maps level → label/kbps", () => {
    expect(resolutionProfile("hd")).toMatchObject({ label: "720p", kbps: 1800 });
    expect(resolutionProfile("audio")).toMatchObject({ kbps: 0 });
    expect(resolutionProfile("auto").label).toBe("Auto");
  });
  it("buildMeetingNotes extracts summary/decisions/nextSteps", () => {
    const notes = buildMeetingNotes([
      { id: "1", speaker: "A", text: "We will ship Friday" },
      { id: "2", speaker: "B", text: "We agreed on the plan" },
      { id: "3", speaker: "C", text: "Next action: email the client" },
    ]);
    expect(notes.summary.length).toBeGreaterThan(0);
    expect(notes.decisions.length).toBeGreaterThan(0);
    expect(notes.nextSteps.length).toBeGreaterThan(0);
  });
});
