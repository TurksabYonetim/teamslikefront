import { beforeEach, describe, expect, it } from "vitest";
import { directoryStore } from "./directoryStore";

const s = () => directoryStore.getState();

beforeEach(() => {
  directoryStore.getState().resetStore();
});

describe("directoryStore — favoriler", () => {
  it("başlangıçta favori yoktur", () => {
    expect(s().favorites).toEqual([]);
    expect(s().isFavorite("c1")).toBe(false);
  });

  it("toggleFavorite ekler ve çıkarır", () => {
    s().toggleFavorite("c1");
    expect(s().favorites).toContain("c1");
    expect(s().isFavorite("c1")).toBe(true);
    s().toggleFavorite("c1");
    expect(s().favorites).not.toContain("c1");
    expect(s().isFavorite("c1")).toBe(false);
  });

  it("birden fazla favori sırasını korur", () => {
    s().toggleFavorite("c1");
    s().toggleFavorite("c2");
    expect(s().favorites).toEqual(["c1", "c2"]);
  });

  it("aynı favori iki kez eklenmez", () => {
    s().toggleFavorite("c1");
    const before = s().favorites;
    // toggle iki kez = nötr; tekrar ekleyince tek kalır
    s().toggleFavorite("c1");
    s().toggleFavorite("c1");
    expect(s().favorites.filter((f) => f === "c1")).toHaveLength(1);
    expect(before).toEqual(["c1"]);
  });

  it("resetStore favorileri temizler", () => {
    s().toggleFavorite("c1");
    s().resetStore();
    expect(s().favorites).toEqual([]);
  });
});
