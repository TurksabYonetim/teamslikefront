// web/src/features/appointments/appointments.api.test.ts
import { describe, it, expect } from "vitest";
import { appointmentsApi } from "./appointments.api";

describe("appointmentsApi (mock layer)", () => {
  it("fetchEventTypes seed listesini döner", async () => {
    const list = await appointmentsApi.fetchEventTypes();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("durationMin");
  });

  it("fetchEventTypes workspaceId ile süzer", async () => {
    const all = await appointmentsApi.fetchEventTypes();
    const withWs = all.find((e) => e.workspaceId);
    if (withWs) {
      const filtered = await appointmentsApi.fetchEventTypes(withWs.workspaceId);
      expect(filtered.every((e) => e.workspaceId == null || e.workspaceId === withWs.workspaceId)).toBe(true);
    } else {
      // hiçbir seed alanına bağlı değilse hepsi (global) görünür
      expect((await appointmentsApi.fetchEventTypes("ws_core")).length).toBe(all.length);
    }
  });

  it("fetchSlots gelecekteki slotları döner", async () => {
    const types = await appointmentsApi.fetchEventTypes();
    const dateISO = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const slots = await appointmentsApi.fetchSlots(types[0].id, dateISO);
    expect(Array.isArray(slots)).toBe(true);
    slots.forEach((s) => expect(s.endMs).toBeGreaterThan(s.startMs));
  });

  it("fetchSlots bilinmeyen event type'ta boş döner", async () => {
    const slots = await appointmentsApi.fetchSlots("yok", "2030-01-01");
    expect(slots).toEqual([]);
  });

  it("createBooking pending rezervasyon üretir (id + endMs)", async () => {
    const types = await appointmentsApi.fetchEventTypes();
    const start = Date.now() + 30 * 60 * 60 * 1000;
    const b = await appointmentsApi.createBooking({
      eventTypeId: types[0].id,
      inviteeName: "Morpheus",
      inviteeEmail: "morpheus@m.co",
      startMs: start,
    });
    expect(b.id).toBeTruthy();
    expect(b.status).toBe("pending");
    expect(b.endMs).toBe(start + types[0].durationMin * 60_000);
  });

  it("patchBooking durum + alan günceller", async () => {
    const types = await appointmentsApi.fetchEventTypes();
    const b = await appointmentsApi.createBooking({
      eventTypeId: types[0].id,
      inviteeName: "Neo",
      inviteeEmail: "neo@m.co",
      startMs: Date.now() + 40 * 60 * 60 * 1000,
    });
    const patched = await appointmentsApi.patchBooking(b.id, { status: "confirmed" });
    expect(patched.status).toBe("confirmed");
    expect(patched.id).toBe(b.id);
  });

  it("mock çağrılar gerçekten async (gecikmeli)", async () => {
    const t0 = Date.now();
    await appointmentsApi.fetchEventTypes();
    expect(Date.now() - t0).toBeGreaterThanOrEqual(80);
  });
});
