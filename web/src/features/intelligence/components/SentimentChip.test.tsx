import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SentimentChip, fmtClock, sentimentFromValue } from "./SentimentChip";
describe("SentimentChip", () => {
  it("renders the sentiment label", () => {
    render(<SentimentChip sentiment="positive" />);
    expect(screen.getByText(/positive|olumlu/i)).toBeInTheDocument();
  });
  it("fmtClock formats seconds", () => { expect(fmtClock(75)).toBe("1:15"); });
  it("sentimentFromValue thresholds", () => {
    expect(sentimentFromValue(0.5)).toBe("positive");
    expect(sentimentFromValue(-0.5)).toBe("negative");
    expect(sentimentFromValue(0)).toBe("neutral");
  });
});
