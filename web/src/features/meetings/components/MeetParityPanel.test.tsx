import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeetParityPanel } from "./MeetParityPanel";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("MeetParityPanel", () => {
  it("companion toggle flips store", () => {
    render(<MeetParityPanel />);
    fireEvent.click(screen.getByRole("button", { name: /companion/i }));
    expect(meetingStore.getState().companionMode).toBe(true);
  });

  it("toggling a capture FX updates meetFx map", () => {
    render(<MeetParityPanel />);
    fireEvent.click(screen.getByRole("button", { name: /watermark/i }));
    expect(meetingStore.getState().meetFx.watermark).toBe(true);
  });

  it("archive search filters", () => {
    render(<MeetParityPanel />);
    const input = screen.getByLabelText(/archive|arşiv/i);
    fireEvent.change(input, { target: { value: "standup" } });
    expect(screen.getByText(/Daily Standup/)).toBeInTheDocument();
  });
});
