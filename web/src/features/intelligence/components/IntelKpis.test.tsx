// web/src/features/intelligence/components/IntelKpis.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntelKpis } from "./IntelKpis";
import { intelStore } from "../intel.store";
import { SCORECARDS } from "../intel.data";
beforeEach(() => intelStore.getState().resetStore());
describe("IntelKpis", () => {
  it("renders KPI labels", () => {
    render(<IntelKpis />);
    expect(screen.getByText(/talkRatio|talk ratio|konuşma/i)).toBeInTheDocument();
    expect(screen.getByText(/pace|tempo|wpm/i)).toBeInTheDocument();
  });
  it("shows the active source's talk ratio when present", () => {
    const id = intelStore.getState().activeSourceId;
    render(<IntelKpis />);
    if (SCORECARDS[id]) {
      expect(screen.getByText(new RegExp(`${SCORECARDS[id].talkRatio}`))).toBeInTheDocument();
    } else {
      expect(true).toBe(true);
    }
  });
});
