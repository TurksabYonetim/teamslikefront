import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("CreateRoomDialog", () => {
  it("creates a room", () => {
    render(<CreateRoomDialog open onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/roomNamePh|room name|oda ad/i), {
      target: { value: "Sprint" },
    });
    const before = meetingStore.getState().rooms.length;
    fireEvent.click(
      screen.getByRole("button", { name: /createRoom|create room|oda oluştur/i }),
    );
    expect(meetingStore.getState().rooms.length).toBe(before + 1);
  });
});
