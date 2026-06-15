import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "./useIsMobile";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useIsMobile", () => {
  it("returns true when matchMedia matches", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      }),
    );
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when matchMedia does not match", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      }),
    );
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
