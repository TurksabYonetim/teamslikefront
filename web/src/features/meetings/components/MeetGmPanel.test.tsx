import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeetGmPanel } from "./MeetGmPanel";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("MeetGmPanel", () => {
  it("audio lock toggle flips store", () => {
    render(<MeetGmPanel />);
    fireEvent.click(screen.getByRole("button", { name: /audioLock|ses kilidi|audio lock/i }));
    expect(meetingStore.getState().audioLock).toBe(true);
  });

  it("generate notes populates meetingNotes", () => {
    render(<MeetGmPanel />);
    fireEvent.click(screen.getByRole("button", { name: /generate|oluştur/i }));
    expect(meetingStore.getState().meetingNotes).not.toBeNull();
  });
});
