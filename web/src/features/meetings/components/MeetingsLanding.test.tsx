import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeetingsLanding } from "./MeetingsLanding";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("MeetingsLanding", () => {
  it("lists upcoming meetings and persistent rooms", () => {
    render(<MeetingsLanding />);
    expect(screen.getByText(/Daily Standup/)).toBeInTheDocument();
    expect(screen.getByText(/War Room/)).toBeInTheDocument();
  });

  it("new meeting starts instant (phase in)", () => {
    render(<MeetingsLanding />);
    fireEvent.click(
      screen.getByRole("button", { name: /newMeeting|new meeting|yeni toplantı/i }),
    );
    expect(meetingStore.getState().phase).toBe("in");
  });

  it("joining a meeting goes to prejoin", () => {
    render(<MeetingsLanding />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /joinShort|join|katıl/i })[0],
    );
    expect(meetingStore.getState().phase).toBe("prejoin");
  });
});
