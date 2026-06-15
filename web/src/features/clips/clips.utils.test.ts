import { describe, it, expect } from "vitest";
import {
  formatDuration,
  isValidVideoUrl,
  filterAndSortClips,
  type ClipSort,
} from "./clips.utils";
import type { Clip } from "./clips.types";

function clip(p: Partial<Clip>): Clip {
  return {
    id: "x",
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: null,
    duration_s: null,
    created_at: "2026-01-01T00:00:00Z",
    ...p,
  } as Clip;
}

describe("formatDuration", () => {
  it("mm:ss biçimler", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(599)).toBe("9:59");
  });
  it("saat varsa h:mm:ss", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
  });
  it("geçersiz girdide boş döner", () => {
    expect(formatDuration(null)).toBe("");
    expect(formatDuration(undefined)).toBe("");
    expect(formatDuration(-5)).toBe("");
  });
});

describe("isValidVideoUrl", () => {
  it("http(s) ve relative kabul eder", () => {
    expect(isValidVideoUrl("https://x.com/v.mp4")).toBe(true);
    expect(isValidVideoUrl("http://x.com/v.mp4")).toBe(true);
    expect(isValidVideoUrl("/clips/a.mp4")).toBe(true);
    expect(isValidVideoUrl("//cdn/a.mp4")).toBe(true);
  });
  it("boş ve bariz hatalıyı reddeder", () => {
    expect(isValidVideoUrl("")).toBe(false);
    expect(isValidVideoUrl("   ")).toBe(false);
    expect(isValidVideoUrl("ftp://x/a")).toBe(false);
    expect(isValidVideoUrl("not a url")).toBe(false);
  });
});

describe("filterAndSortClips", () => {
  const a = clip({ id: "a", title: "Alfa", duration_s: 30, created_at: "2026-01-01T00:00:00Z" });
  const b = clip({ id: "b", title: "Beta", description: "deniz", duration_s: 90, created_at: "2026-02-01T00:00:00Z" });
  const c = clip({ id: "c", title: "Gama", duration_s: 10, created_at: "2026-03-01T00:00:00Z" });
  const all = [a, b, c];

  it("başlık ve açıklamada arar", () => {
    expect(filterAndSortClips(all, "beta", "newest").map((x) => x.id)).toEqual(["b"]);
    expect(filterAndSortClips(all, "deniz", "newest").map((x) => x.id)).toEqual(["b"]);
  });
  it("sıralar (newest/oldest/longest/shortest/title)", () => {
    const ids = (s: ClipSort) => filterAndSortClips(all, "", s).map((x) => x.id);
    expect(ids("newest")).toEqual(["c", "b", "a"]);
    expect(ids("oldest")).toEqual(["a", "b", "c"]);
    expect(ids("longest")).toEqual(["b", "a", "c"]);
    expect(ids("shortest")).toEqual(["c", "a", "b"]);
    expect(ids("title")).toEqual(["a", "b", "c"]);
  });
  it("orijinal diziyi bozmaz", () => {
    const orig = [...all];
    filterAndSortClips(all, "", "title");
    expect(all).toEqual(orig);
  });
});
