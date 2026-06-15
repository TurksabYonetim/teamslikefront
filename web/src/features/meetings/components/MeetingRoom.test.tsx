import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MeetingRoom } from "./MeetingRoom";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

function renderRoom() {
  return render(
    <MemoryRouter>
      <MeetingRoom />
    </MemoryRouter>,
  );
}

describe("MeetingRoom", () => {
  it("shows the meeting title and participant count", () => {
    renderRoom();
    expect(screen.getByText(/Daily Standup/)).toBeInTheDocument();
  });

  it("shows the lobby banner with admit/deny for a waiting entry", () => {
    renderRoom();
    expect(screen.getByText(/Jordan/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /admit|kabul/i })).toBeInTheDocument();
  });

  it("recording shows REC indicator", () => {
    meetingStore.getState().toggleRecording();
    renderRoom();
    expect(screen.getByText(/rec|kayıt/i)).toBeInTheDocument();
  });
});
