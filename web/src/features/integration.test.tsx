// web/src/features/integration.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSendActionToChat, useOpenIntelligence } from "./integration";
import { messagingStore } from "./messaging/store";
import { intelStore } from "./intelligence/intel.store";
import { SOURCES } from "./intelligence/intel.data";
beforeEach(() => { messagingStore.getState().resetStore(); intelStore.getState().resetStore(); });
const wrap = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;
describe("integration", () => {
  it("useSendActionToChat posts to product channel with check prefix", () => {
    const { result } = renderHook(() => useSendActionToChat(), { wrapper: wrap });
    result.current("call the client");
    expect(messagingStore.getState().messages.some((m) => m.channelId === "ch_product" && m.body.includes("call the client"))).toBe(true);
  });
  it("useOpenIntelligence sets the intel source", () => {
    const { result } = renderHook(() => useOpenIntelligence(), { wrapper: wrap });
    result.current(SOURCES[1].id);
    expect(intelStore.getState().activeSourceId).toBe(SOURCES[1].id);
  });
});
