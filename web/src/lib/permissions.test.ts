import { describe, expect, it } from "vitest";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, roleCan } from "./permissions";

describe("permissions", () => {
  it("owner ve admin tüm yetkilere sahip", () => {
    for (const p of ALL_PERMISSIONS) {
      expect(roleCan("owner", p)).toBe(true);
      expect(roleCan("admin", p)).toBe(true);
    }
  });

  it("member yönetim yetkilerine sahip değil", () => {
    expect(roleCan("member", "admin.view")).toBe(false);
    expect(roleCan("member", "admin.access")).toBe(false);
  });

  it("member normal sekme görüntüleme yetkilerine sahip", () => {
    expect(roleCan("member", "messaging.view")).toBe(true);
    expect(roleCan("member", "docs.view")).toBe(true);
    expect(roleCan("member", "support.view")).toBe(true);
  });

  it("ROLE_PERMISSIONS her rol için tanımlı", () => {
    expect(ROLE_PERMISSIONS.owner.length).toBe(ALL_PERMISSIONS.length);
    expect(ROLE_PERMISSIONS.member.length).toBeLessThan(ALL_PERMISSIONS.length);
  });
});
