// web/src/lib/useOnce.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnce } from "./useOnce";
beforeEach(() => localStorage.clear());
describe("useOnce", () => {
  it("starts unseen and marks seen (persisted)", () => {
    const { result } = renderHook(() => useOnce("demo"));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem("tl_onboarded_demo")).toBe("1");
  });
  it("reads already-seen from storage", () => {
    localStorage.setItem("tl_onboarded_demo", "1");
    const { result } = renderHook(() => useOnce("demo"));
    expect(result.current[0]).toBe(true);
  });
});
