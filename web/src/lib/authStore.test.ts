import { afterEach, describe, expect, it } from "vitest";
import { authStore, can } from "./authStore";

afterEach(() => {
  authStore.setState({ user: { ...authStore.getState().user, role: "admin" } });
});

describe("authStore", () => {
  it("varsayılan admin tüm yetkilere sahip", () => {
    expect(can("admin.access")).toBe(true);
    expect(can("messaging.view")).toBe(true);
  });

  it("setRole member yapınca yönetim yetkisi kaybolur", () => {
    authStore.getState().setRole("member");
    expect(can("admin.access")).toBe(false);
    expect(can("messaging.view")).toBe(true);
  });

  it("setRole owner yapınca tüm yetkiler döner", () => {
    authStore.getState().setRole("owner");
    expect(can("admin.access")).toBe(true);
  });
});
