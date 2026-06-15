import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCanvasOverlay } from "./canvas.overlay";

describe("useCanvasOverlay", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("varsayılan: docTitle yok, hiçbir blok pinli değil", () => {
    const { result } = renderHook(() => useCanvasOverlay());
    expect(result.current.docTitle).toBeUndefined();
    expect(result.current.isPinned("b1")).toBe(false);
  });

  it("setDocTitle başlığı kalıcı yapar", () => {
    const { result } = renderHook(() => useCanvasOverlay());
    act(() => result.current.setDocTitle("Q3 Planı"));
    expect(result.current.docTitle).toBe("Q3 Planı");
    // localStorage'a yazıldı mı
    expect(localStorage.getItem("tl_canvas_overlay")).toContain("Q3 Planı");
  });

  it("togglePin pinler ve tekrar çağrı kaldırır", () => {
    const { result } = renderHook(() => useCanvasOverlay());
    act(() => result.current.togglePin("b1"));
    expect(result.current.isPinned("b1")).toBe(true);
    act(() => result.current.togglePin("b1"));
    expect(result.current.isPinned("b1")).toBe(false);
  });

  it("birden çok blok bağımsız pinlenir", () => {
    const { result } = renderHook(() => useCanvasOverlay());
    act(() => result.current.togglePin("b1"));
    act(() => result.current.togglePin("b2"));
    expect(result.current.isPinned("b1")).toBe(true);
    expect(result.current.isPinned("b2")).toBe(true);
    expect(result.current.pinnedSet.size).toBe(2);
  });
});
