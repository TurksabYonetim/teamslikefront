// web/src/features/support/support.api.test.ts
import { describe, it, expect } from "vitest";
import { aiSuggest } from "./support.api";

describe("aiSuggest (niyet tabanlı taslak)", () => {
  it("faturalama niyetinde faturalama yanıtı önerir", async () => {
    const text = await aiSuggest("cv1");
    expect(text.toLowerCase()).toContain("fatura");
  });

  it("hata/bug niyetinde mühendislik eskalasyon yanıtı önerir", async () => {
    const text = await aiSuggest("cv2");
    expect(text.toLowerCase()).toContain("mühendis");
  });

  it("tanımsız konuşmada genel yardım yanıtı döner", async () => {
    const text = await aiSuggest("yok");
    expect(text.length).toBeGreaterThan(0);
  });
});
