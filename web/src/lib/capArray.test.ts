import { describe, it, expect } from "vitest";
import { capArray } from "./capArray";
describe("capArray", () => {
  it("keeps the last n items", () => {
    expect(capArray([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5]);
    expect(capArray([1, 2], 5)).toEqual([1, 2]);
  });
});
