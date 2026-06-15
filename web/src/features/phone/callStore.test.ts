import { beforeEach, describe, expect, it } from "vitest";
import { callStore } from "./callStore";
import type { CallEvent } from "./phone.types";
import type { MonitorMode } from "./phone.types";

const s = () => callStore.getState();

beforeEach(() => {
  callStore.getState().resetStore();
});

describe("callStore — temel akış", () => {
  it("başlangıçta boştadır", () => {
    expect(s().activeCall).toBeNull();
    expect(s().parked).toEqual([]);
    expect(s().pendingLog).toBeNull();
    expect(s().muted).toBe(false);
  });

  it("place() giden çağrıyı 'ringing' durumunda başlatır", () => {
    s().place("+14155559999", "Ada Lovelace");
    expect(s().activeCall?.direction).toBe("outbound");
    expect(s().activeCall?.state).toBe("ringing");
    expect(s().activeCall?.to).toBe("+14155559999");
    expect(s().peerName).toBe("Ada Lovelace");
  });

  it("simulateInbound() gelen çağrıyı 'ringing' durumunda başlatır", () => {
    s().simulateInbound("+14155551234", "Grace Hopper");
    expect(s().activeCall?.direction).toBe("inbound");
    expect(s().activeCall?.state).toBe("ringing");
    expect(s().activeCall?.from).toBe("+14155551234");
  });

  it("answer() ringing → active geçişi yapar ve süreyi sıfırlar", () => {
    s().place("+14155559999");
    s().answer();
    expect(s().activeCall?.state).toBe("active");
    expect(s().activeCall?.durationSec).toBe(0);
  });

  it("tick() yalnızca active çağrının süresini artırır", () => {
    s().place("+14155559999");
    s().tick(); // ringing → değişmez
    expect(s().activeCall?.durationSec).toBe(0);
    s().answer();
    s().tick();
    s().tick();
    expect(s().activeCall?.durationSec).toBe(2);
  });

  it("hold()/resume() active ⇄ hold geçişi yapar", () => {
    s().place("+14155559999");
    s().answer();
    s().hold();
    expect(s().activeCall?.state).toBe("hold");
    s().resume();
    expect(s().activeCall?.state).toBe("active");
  });

  it("toggleMute() mute bayrağını çevirir", () => {
    s().place("+14155559999");
    s().toggleMute();
    expect(s().muted).toBe(true);
    s().toggleMute();
    expect(s().muted).toBe(false);
  });

  it("toggleRecording() kaydı açar ve ilk açılışta recordingId atar", () => {
    s().place("+14155559999");
    s().answer();
    s().toggleRecording();
    expect(s().activeCall?.recording).toBe(true);
    const id = s().activeCall?.recordingId;
    expect(id).toBeTruthy();
    s().toggleRecording();
    expect(s().activeCall?.recording).toBe(false);
    expect(s().activeCall?.recordingId).toBe(id); // korunur
  });

  it("sendDtmf() basılan tuşları biriktirir", () => {
    s().place("+14155559999");
    s().answer();
    s().sendDtmf("1");
    s().sendDtmf("2");
    expect(s().activeCall?.dtmf).toBe("12");
  });

  it("addToCall() konferansa katılımcı ekler", () => {
    s().place("+14155559999");
    s().answer();
    s().addToCall("+14155550000");
    expect(s().activeCall?.participants).toEqual(["+14155550000"]);
  });

  it("aktif çağrı varken place() mevcut çağrıyı ezmez (tek-çağrı modeli)", () => {
    s().place("+14155559999", "Ada");
    s().answer();
    const original = s().activeCall;
    s().place("+14155550000", "Grace"); // yok sayılmalı
    expect(s().activeCall).toBe(original);
    expect(s().activeCall?.to).toBe("+14155559999");
    expect(s().pendingLog).toBeNull(); // çağrı kaybı yok
  });

  it("aktif çağrı varken simulateInbound() mevcut çağrıyı ezmez", () => {
    s().place("+14155559999");
    s().answer();
    const original = s().activeCall;
    s().simulateInbound("+14155551234", "Spam"); // yok sayılmalı
    expect(s().activeCall).toBe(original);
  });
});

describe("callStore — sonlandırma ve persist", () => {
  it("giden çağrı hangup'ında outbound pendingLog üretir", () => {
    s().place("+14155559999", "Ada");
    s().answer();
    s().tick();
    s().hangup();
    expect(s().activeCall).toBeNull();
    expect(s().pendingLog).toMatchObject({
      direction: "outbound",
      peer_number: "+14155559999",
      peer_name: "Ada",
      duration_s: 1,
    });
    expect(typeof s().pendingLog?.started_at).toBe("string");
  });

  it("yanıtlanmamış gelen çağrı hangup'ı 'missed' kaydı üretir", () => {
    s().simulateInbound("+14155551234");
    s().hangup(); // hâlâ ringing
    expect(s().pendingLog?.direction).toBe("missed");
    expect(s().pendingLog?.duration_s).toBe(0);
  });

  it("decline() gelen çağrıyı 'missed' olarak kaydeder", () => {
    s().simulateInbound("+14155551234");
    s().decline();
    expect(s().activeCall).toBeNull();
    expect(s().pendingLog?.direction).toBe("missed");
  });

  it("yanıtlanmış gelen çağrı hangup'ı 'inbound' kaydı üretir", () => {
    s().simulateInbound("+14155551234", "Grace");
    s().answer();
    s().tick();
    s().tick();
    s().hangup();
    expect(s().pendingLog?.direction).toBe("inbound");
    expect(s().pendingLog?.duration_s).toBe(2);
  });

  it("transfer() aktif çağrıyı tamamlanmış olarak sonlandırır", () => {
    s().place("+14155559999");
    s().answer();
    s().transfer("102");
    expect(s().activeCall).toBeNull();
    expect(s().pendingLog?.direction).toBe("outbound");
  });

  it("clearPendingLog() persist sonrası kaydı temizler", () => {
    s().place("+14155559999");
    s().hangup();
    expect(s().pendingLog).not.toBeNull();
    s().clearPendingLog();
    expect(s().pendingLog).toBeNull();
  });
});

describe("callStore — park", () => {
  it("park() aktif çağrıyı parked listesine taşır, pickup() geri alır", () => {
    s().place("+14155559999");
    s().answer();
    const id = s().activeCall!.id;
    s().park();
    expect(s().activeCall).toBeNull();
    expect(s().parked).toHaveLength(1);
    s().pickup(id);
    expect(s().activeCall?.id).toBe(id);
    expect(s().activeCall?.state).toBe("active");
    expect(s().parked).toHaveLength(0);
  });

  it("aktif çağrı varken pickup() yapılamaz", () => {
    s().place("+1");
    s().answer();
    s().park();
    const parkedId = s().parked[0].id;
    s().place("+2"); // yeni aktif çağrı
    s().pickup(parkedId); // engellenmeli
    expect(s().activeCall?.to).toBe("+2");
    expect(s().parked).toHaveLength(1);
  });
});

describe("callStore — danışma / sıcak transfer", () => {
  it("startConsult aktif çağrıyı hold'a alır, consult danışma çağrısı kurar", () => {
    s().place("+14155559999", "Ada");
    s().answer();
    s().startConsult("102", "Satış");
    expect(s().activeCall?.state).toBe("hold");
    expect(s().consult?.peer).toBe("102");
    expect(s().consult?.name).toBe("Satış");
  });

  it("startConsult yalnızca active çağrıda çalışır", () => {
    s().place("+14155559999");
    // henüz ringing
    s().startConsult("102");
    expect(s().consult).toBeNull();
    expect(s().activeCall?.state).toBe("ringing");
  });

  it("aynı anda iki danışma kurulamaz", () => {
    s().place("+1");
    s().answer();
    s().startConsult("102");
    const first = s().consult;
    s().startConsult("103");
    expect(s().consult).toBe(first);
  });

  it("completeTransfer aktif çağrıyı sonlandırır ve danışmayı temizler", () => {
    s().place("+14155559999", "Ada");
    s().answer();
    s().startConsult("102");
    s().completeTransfer();
    expect(s().activeCall).toBeNull();
    expect(s().consult).toBeNull();
    expect(s().pendingLog?.direction).toBe("outbound");
  });

  it("mergeConsult danışmayı katılımcı yapar ve çağrıyı active'e döndürür", () => {
    s().place("+14155559999");
    s().answer();
    s().startConsult("102", "Satış");
    s().mergeConsult();
    expect(s().consult).toBeNull();
    expect(s().activeCall?.state).toBe("active");
    expect(s().activeCall?.participants).toContain("102");
  });

  it("cancelConsult danışmayı bırakır ve çağrıyı active'e döndürür", () => {
    s().place("+14155559999");
    s().answer();
    s().startConsult("102");
    s().cancelConsult();
    expect(s().consult).toBeNull();
    expect(s().activeCall?.state).toBe("active");
  });

  it("danışma yokken completeTransfer/mergeConsult/cancelConsult no-op", () => {
    s().place("+14155559999");
    s().answer();
    s().completeTransfer();
    expect(s().activeCall).not.toBeNull();
    s().mergeConsult();
    s().cancelConsult();
    expect(s().consult).toBeNull();
  });
});

describe("callStore — bekletme müziği", () => {
  it("toggleHoldMusic bayrağı çevirir", () => {
    s().place("+14155559999");
    s().answer();
    expect(s().holdMusic).toBe(false);
    s().toggleHoldMusic();
    expect(s().holdMusic).toBe(true);
    s().toggleHoldMusic();
    expect(s().holdMusic).toBe(false);
  });

  it("aktif çağrı yokken toggleHoldMusic no-op", () => {
    s().toggleHoldMusic();
    expect(s().holdMusic).toBe(false);
  });

  it("resetStore consult/holdMusic'i de sıfırlar", () => {
    s().place("+1");
    s().answer();
    s().startConsult("102");
    s().toggleHoldMusic();
    s().resetStore();
    expect(s().consult).toBeNull();
    expect(s().holdMusic).toBe(false);
  });
});

describe("callStore — applyEvent idempotency (WS sözleşmesi)", () => {
  const placed: CallEvent = {
    type: "call.placed",
    call: {
      id: "c1", lineId: "line_main", direction: "inbound",
      from: "+14155551234", to: "+14155551000", state: "ringing",
      startedAt: 1_780_000_000_000, durationSec: 0,
    },
  };

  it("call.placed iki kez uygulanınca tek çağrı kalır", () => {
    s().applyEvent(placed);
    const first = s().activeCall;
    s().applyEvent(placed);
    expect(s().activeCall).toBe(first); // aynı referans; yeniden kurulmaz
  });

  it("call.answered tekrar uygulanınca durum bozulmaz", () => {
    s().applyEvent(placed);
    s().applyEvent({ type: "call.answered", callId: "c1" });
    expect(s().activeCall?.state).toBe("active");
    s().applyEvent({ type: "call.answered", callId: "c1" }); // no-op
    expect(s().activeCall?.state).toBe("active");
  });

  it("call.ended tekrar uygulanınca ikinci kez kayıt üretmez", () => {
    s().applyEvent(placed);
    s().applyEvent({ type: "call.answered", callId: "c1" });
    s().applyEvent({ type: "call.ended", callId: "c1", reason: "completed" });
    expect(s().activeCall).toBeNull();
    expect(s().pendingLog?.direction).toBe("inbound");
    s().clearPendingLog();
    s().applyEvent({ type: "call.ended", callId: "c1", reason: "completed" }); // no-op
    expect(s().pendingLog).toBeNull();
  });

  it("aktif çağrı varken farklı bir call.placed olayı yok sayılır", () => {
    s().applyEvent(placed);
    const first = s().activeCall;
    s().applyEvent({
      type: "call.placed",
      call: { ...placed.call, id: "c2", from: "+19999999999" },
    });
    expect(s().activeCall).toBe(first); // farklı id'li ikinci çağrı reddedilir
    expect(s().activeCall?.id).toBe("c1");
  });
});

describe("callStore — Faz 6 cila (blocklist/monitor/disposition)", () => {
  it("blockNumber/unblock blocklist'i günceller", () => {
    s().blockNumber("+14155550000");
    expect(s().blocklist).toContain("+14155550000");
    s().blockNumber("+14155550000");
    expect(s().blocklist.filter((b) => b === "+14155550000").length).toBe(1);
    s().unblock("+14155550000");
    expect(s().blocklist).not.toContain("+14155550000");
  });

  it("setMonitor/stopMonitor monitor modunu ayarlar", () => {
    s().setMonitor("whisper" as MonitorMode);
    expect(s().monitor).toBe("whisper");
    s().stopMonitor();
    expect(s().monitor).toBeNull();
  });

  it("yanıtlanan çağrı bitince pendingDisposition üretir", () => {
    s().place("+14155559999", "Ada");
    s().answer();
    s().hangup();
    expect(s().pendingDisposition).toMatchObject({ peerNumber: "+14155559999" });
    expect(s().pendingDisposition?.callId).toBeTruthy();
  });

  it("cevapsız/reddedilen çağrı dispozisyon üretmez", () => {
    s().simulateInbound("+14155551234");
    s().decline();
    expect(s().pendingDisposition).toBeNull();
  });

  it("saveDisposition kaydeder ve pendingDisposition'ı temizler", () => {
    s().place("+1");
    s().answer();
    s().hangup();
    const callId = s().pendingDisposition!.callId;
    s().saveDisposition({ callId, outcome: "resolved", note: "ok", tags: ["vip"] });
    expect(s().dispositions).toHaveLength(1);
    expect(s().dispositions[0].outcome).toBe("resolved");
    expect(s().pendingDisposition).toBeNull();
  });

  it("dismissWrapUp kaydetmeden temizler", () => {
    s().place("+1");
    s().answer();
    s().hangup();
    s().dismissWrapUp();
    expect(s().pendingDisposition).toBeNull();
    expect(s().dispositions).toHaveLength(0);
  });

  it("resetStore yeni state'i de sıfırlar", () => {
    s().blockNumber("+1");
    s().setMonitor("listen" as MonitorMode);
    s().resetStore();
    expect(s().blocklist).toEqual([]);
    expect(s().monitor).toBeNull();
    expect(s().pendingDisposition).toBeNull();
    expect(s().dispositions).toEqual([]);
  });
});
