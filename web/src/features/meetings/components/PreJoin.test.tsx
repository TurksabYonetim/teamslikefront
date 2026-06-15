import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreJoin } from "./PreJoin";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("PreJoin", () => {
  it("join sets phase to in", () => {
    meetingStore.getState().openPrejoin("mtg_standup", "Daily Standup");
    render(<PreJoin />);
    fireEvent.click(screen.getByRole("button", { name: /joinNow|join now|şimdi katıl/i }));
    expect(meetingStore.getState().phase).toBe("in");
  });
  it("mic toggle flips store", () => {
    render(<PreJoin />);
    const before = meetingStore.getState().micOn;
    fireEvent.click(screen.getByRole("button", { name: /mute|unmute|mikrofon|sustur/i }));
    expect(meetingStore.getState().micOn).toBe(!before);
  });
});
