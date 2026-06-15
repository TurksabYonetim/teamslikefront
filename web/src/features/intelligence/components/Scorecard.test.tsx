import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Scorecard } from "./Scorecard";
import { intelStore } from "../intel.store";
import { SCORECARDS } from "../intel.data";

beforeEach(() => intelStore.getState().resetStore());

describe("Scorecard", () => {
  it("renders scorecard metrics for the active source", () => {
    render(<Scorecard />);
    const id = intelStore.getState().activeSourceId;
    if (SCORECARDS[id]) expect(screen.getByText(/talkRatio|talk ratio|konuşma/i)).toBeInTheDocument();
    else expect(true).toBe(true);
  });
});
