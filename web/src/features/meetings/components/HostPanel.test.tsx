import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HostPanel } from "./HostPanel";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("HostPanel", () => {
  it("is hidden unless sidePanel is host", () => {
    const { container } = render(<HostPanel />);
    expect(container.firstChild).toBeNull();
  });

  it("lock meeting toggle works when open", () => {
    meetingStore.getState().setSidePanel("host");
    render(<HostPanel />);
    fireEvent.click(screen.getByRole("button", { name: /lockMeeting|lock meeting|kilitle/i }));
    expect(meetingStore.getState().locked).toBe(true);
  });

  it("mute all mutes others", () => {
    meetingStore.getState().setSidePanel("host");
    render(<HostPanel />);
    fireEvent.click(screen.getByRole("button", { name: /muteAll|mute all|herkesi/i }));
    expect(
      meetingStore
        .getState()
        .participants.filter((p) => !p.isSelf)
        .every((p) => !p.micOn),
    ).toBe(true);
  });
});
