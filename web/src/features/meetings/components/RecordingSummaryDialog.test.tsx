import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordingSummaryDialog } from "./RecordingSummaryDialog";

describe("RecordingSummaryDialog", () => {
  it("renders summary + transcript when open", () => {
    render(<RecordingSummaryDialog open onClose={() => {}} />);
    expect(screen.getByText(/aiSummary|summary|özet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download|indir/i })).toBeInTheDocument();
  });
});
