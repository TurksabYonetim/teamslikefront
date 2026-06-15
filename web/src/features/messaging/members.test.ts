// web/src/features/messaging/members.test.ts
import { describe, it, expect } from "vitest";
import { memberById, memberName, presenceOf, colorFor, initialsFor, ME_ID } from "./members";

describe("members", () => {
  it("returns a member by id and its name", () => {
    expect(memberById(ME_ID)).toBeTruthy();
    expect(memberName(ME_ID)).toBe("Siz");
  });

  it("falls back gracefully for unknown ids", () => {
    expect(memberName("usr_unknown")).toBe("usr_unknown");
    expect(presenceOf("usr_unknown")).toBe("offline");
  });

  it("colorFor is deterministic for the same seed", () => {
    expect(colorFor("abc")).toBe(colorFor("abc"));
  });

  it("initialsFor produces up to 2 uppercase letters", () => {
    expect(initialsFor("Defne Yıldız")).toBe("DY");
    expect(initialsFor("product")).toBe("P");
    expect(initialsFor("")).toBe("?");
  });
});
