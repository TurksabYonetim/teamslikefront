import { describe, it, expect, beforeEach } from "vitest";
import { inboxStore } from "./inbox.store";

beforeEach(() => inboxStore.getState().reset());
const get = () => inboxStore.getState();

describe("inboxStore", () => {
  it("varsayılanlar", () => {
    expect(get().activeInboxId).toBeNull();
    expect(get().filterStatus).toBe("all");
    expect(get().assignee).toBe("all");
    expect(get().query).toBe("");
    expect(get().inboxes.length).toBeGreaterThan(0);
  });
  it("setter'lar durumu günceller", () => {
    get().setInbox("ib_wa");
    get().setFilter("open");
    get().setAssignee("mine");
    get().setQuery("fatura");
    expect(get().activeInboxId).toBe("ib_wa");
    expect(get().filterStatus).toBe("open");
    expect(get().assignee).toBe("mine");
    expect(get().query).toBe("fatura");
  });
  it("reset varsayılana döner", () => {
    get().setInbox("ib_wa");
    get().setQuery("x");
    get().reset();
    expect(get().activeInboxId).toBeNull();
    expect(get().query).toBe("");
  });
});
