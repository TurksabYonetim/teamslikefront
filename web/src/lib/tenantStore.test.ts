import { describe, expect, it } from "vitest";
import { inActiveWorkspace } from "./tenantStore";

describe("inActiveWorkspace", () => {
  it("aktif alan null ise her kayıt görünür", () => {
    expect(inActiveWorkspace("ws_core", null)).toBe(true);
    expect(inActiveWorkspace(null, null)).toBe(true);
  });

  it("kaydın alanı yoksa (global) her zaman görünür", () => {
    expect(inActiveWorkspace(null, "ws_core")).toBe(true);
    expect(inActiveWorkspace(undefined, "ws_growth")).toBe(true);
  });

  it("alan eşleşmesinde filtreler", () => {
    expect(inActiveWorkspace("ws_core", "ws_core")).toBe(true);
    expect(inActiveWorkspace("ws_growth", "ws_core")).toBe(false);
  });
});
