import { describe, it, expect, vi } from "vitest";
import { intelEventGroupsFor, intelEventsFor, subscribeIntel } from "./intel.stream";
import { LIVE_FEED } from "./intel.data";
const SRC = Object.keys(LIVE_FEED)[0]; // canlı feed'i olan ilk kaynak
describe("intel.stream", () => {
  it("groups events per feed item with a caption first", () => {
    const groups = intelEventGroupsFor(SRC);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0][0].type).toBe("caption.emitted");
    expect(intelEventsFor(SRC).length).toBeGreaterThanOrEqual(groups.length);
  });
  it("subscribeIntel emits one group per tick then completes", () => {
    vi.useFakeTimers();
    const seen: string[] = [];
    let done = false;
    const stop = subscribeIntel(SRC, (e) => seen.push(e.type), { intervalMs: 100, onComplete: () => (done = true) });
    vi.advanceTimersByTime(100 * (intelEventGroupsFor(SRC).length + 1));
    expect(seen.length).toBeGreaterThan(0);
    expect(done).toBe(true);
    stop();
    vi.useRealTimers();
  });
});
