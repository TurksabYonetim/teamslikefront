import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";

// Not: jsdom ortamında global URL, göreli yolu sayfa origin'ine (http://localhost)
// göre çözer; bu yüzden import.meta.url'i fs yoluna çevirip node:path ile çözüyoruz.
const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), "../styles/index.css");
const css = readFileSync(cssPath, "utf8");

describe("animasyon token'ları", () => {
  it("custom easing token'larını içerir", () => {
    expect(css).toContain("--ease-out: cubic-bezier(0.23, 1, 0.32, 1)");
    expect(css).toContain("--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)");
  });
  it("reduced-motion kuralını içerir", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
