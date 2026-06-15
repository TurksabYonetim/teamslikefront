import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { CallQueuePanel } from "./CallQueuePanel";
import { pbxStore } from "./pbxStore";

beforeEach(async () => {
  await i18n.changeLanguage("en");
  pbxStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("CallQueuePanel", () => {
  it("kuyruğu, ajanları ve bekleyenleri gösterir", () => {
    render(<CallQueuePanel />);
    expect(screen.getByText("Satış")).toBeInTheDocument();
    expect(screen.getByText("Ece Y.")).toBeInTheDocument();
  });

  it("ajan uygunluğunu değiştirir", () => {
    render(<CallQueuePanel />);
    const before = pbxStore.getState().queues[0].agents[0].available;
    const btn = screen.getAllByRole("button", { name: /Available|Unavailable/ })[0];
    act(() => btn.click());
    expect(pbxStore.getState().queues[0].agents[0].available).toBe(!before);
  });

  it("sonrakini ata bekleyeni azaltır", () => {
    render(<CallQueuePanel />);
    const before = pbxStore.getState().queues[0].waiting.length;
    act(() => screen.getByRole("button", { name: "Assign next" }).click());
    expect(pbxStore.getState().queues[0].waiting.length).toBe(before - 1);
  });

  it("geri arama ister bekleyen çağrıyı işaretler", () => {
    render(<CallQueuePanel />);
    const q = pbxStore.getState().queues[0];
    const callId = q.waiting.find((c) => !c.callbackRequested)!.id;
    act(() => screen.getByRole("button", { name: /Request callback/ }).click());
    expect(pbxStore.getState().queues[0].waiting.find((c) => c.id === callId)!.callbackRequested).toBe(true);
  });
});
