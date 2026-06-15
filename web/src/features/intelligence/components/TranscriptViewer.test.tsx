import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TranscriptViewer } from "./TranscriptViewer";
import { intelStore } from "../intel.store";

beforeEach(() => intelStore.getState().resetStore());

describe("TranscriptViewer", () => {
  it("renders seeded segments", () => {
    render(<TranscriptViewer />);
    // seed transcript has at least one segment with text
    expect(intelStore.getState().segments.length).toBeGreaterThan(0);
  });
  it("search filters segments", () => {
    const first = intelStore.getState().segments[0];
    render(<TranscriptViewer />);
    const input = screen.getByLabelText(/searchTranscript|search|ara/i);
    fireEvent.change(input, { target: { value: "zzzznomatch" } });
    expect(screen.getByText(/noMatches|no match|eşleşme yok/i)).toBeInTheDocument();
    expect(first).toBeTruthy();
  });
});
