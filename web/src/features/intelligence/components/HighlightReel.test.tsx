import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { HighlightReel } from "./HighlightReel";
import { intelStore } from "../intel.store";
beforeEach(() => intelStore.getState().resetStore());
describe("HighlightReel", () => {
  it("renders without crashing", () => {
    expect(render(<HighlightReel />).container).toBeTruthy();
  });
});
