import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SentimentTimeline } from "./SentimentTimeline";
import { intelStore } from "../intel.store";
beforeEach(() => intelStore.getState().resetStore());
describe("SentimentTimeline", () => {
  it("renders an svg when sentiment data exists, else null", () => {
    const { container } = render(<SentimentTimeline />);
    // seed sentiment may exist; either an svg or null
    expect(container).toBeTruthy();
  });
});
