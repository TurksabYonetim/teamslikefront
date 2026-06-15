import { describe, expect, it } from "vitest";
import { buildBlock, matchPrompt } from "./canvas.prompt";

describe("matchPrompt", () => {
  it("boş/whitespace promptta null döner", () => {
    expect(matchPrompt("")).toBeNull();
    expect(matchPrompt("   \n  ")).toBeNull();
  });

  it("checklist anahtar kelimelerini yakalar (en+tr)", () => {
    expect(matchPrompt("create a checklist for launch")?.type).toBe("checklist");
    expect(matchPrompt("yapılacaklar listesi hazırla")?.type).toBe("checklist");
    expect(matchPrompt("to-do list")?.type).toBe("checklist");
  });

  it("table anahtar kelimelerini yakalar", () => {
    expect(matchPrompt("build a comparison table")?.type).toBe("table");
    expect(matchPrompt("tablo oluştur")?.type).toBe("table");
  });

  it("metric anahtar kelimelerini yakalar", () => {
    expect(matchPrompt("show revenue metric")?.type).toBe("metric");
    expect(matchPrompt("kpi göstergesi")?.type).toBe("metric");
  });

  it("action anahtar kelimelerini yakalar", () => {
    expect(matchPrompt("action item: email the client")?.type).toBe("action");
    expect(matchPrompt("aksiyon: müşteriyi ara")?.type).toBe("action");
  });

  it("summary anahtar kelimelerini yakalar", () => {
    expect(matchPrompt("summarize the meeting")?.type).toBe("summary");
    expect(matchPrompt("toplantı özeti")?.type).toBe("summary");
  });

  it("eşleşme yoksa note'a düşer", () => {
    expect(matchPrompt("random freeform thought")?.type).toBe("note");
  });

  it("eşleşen anahtar kelimeyi temizleyip başlık türetir", () => {
    const m = matchPrompt("checklist: pack the bags");
    expect(m?.title.toLowerCase()).toContain("pack the bags");
    expect(m?.title.toLowerCase()).not.toContain("checklist");
  });

  it("ilk eşleşen tip (önceliğe göre) seçilir", () => {
    // hem checklist hem table geçiyor; checklist daha spesifik → öncelik
    const m = matchPrompt("checklist in a table");
    expect(m?.type).toBe("checklist");
  });

  it("uzun başlığı kısaltır", () => {
    const long = "note " + "word ".repeat(40);
    const m = matchPrompt(long);
    expect(m).not.toBeNull();
    expect(m!.title.length).toBeLessThanOrEqual(80);
  });
});

describe("buildBlock", () => {
  it("matchPrompt sonucundan bir create-request üretir", () => {
    const m = matchPrompt("checklist: ship v1")!;
    const block = buildBlock(m);
    expect(block.type).toBe("checklist");
    expect(block.title).toContain("ship v1");
    expect(typeof block.content).toBe("string");
  });

  it("checklist içeriği maddeleri prompt'tan üretir (virgül/satır ayraçlı)", () => {
    const m = matchPrompt("checklist: design, build, ship")!;
    const block = buildBlock(m);
    expect(block.type).toBe("checklist");
    expect(block.content).toContain("- [ ] design");
    expect(block.content).toContain("- [ ] build");
    expect(block.content).toContain("- [ ] ship");
  });

  it("metric içeriği ilk sayıyı değer olarak alır", () => {
    const m = matchPrompt("metric: 1250 active users")!;
    const block = buildBlock(m);
    expect(block.type).toBe("metric");
    expect(block.content.split("\n")[0]).toContain("1250");
  });

  it("table için en az başlık + ayraç satırı şablonu üretir", () => {
    const m = matchPrompt("table of pros and cons")!;
    const block = buildBlock(m);
    expect(block.type).toBe("table");
    expect(block.content).toContain("|");
  });

  it("summary/note/action içeriği boş ya da serbest metin kalır", () => {
    const note = buildBlock(matchPrompt("just a note")!);
    expect(note.type).toBe("note");
    expect(typeof note.content).toBe("string");

    const action = buildBlock(matchPrompt("action: call back")!);
    expect(action.type).toBe("action");
  });
});
