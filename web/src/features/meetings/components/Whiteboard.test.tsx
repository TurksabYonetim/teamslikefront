import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Whiteboard } from "./Whiteboard";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("Whiteboard", () => {
  it("renders toolbar and close toggles whiteboard off", () => {
    meetingStore.setState({ whiteboardOpen: true });
    render(<Whiteboard />);
    fireEvent.click(screen.getByRole("button", { name: /close|kapat/i }));
    expect(meetingStore.getState().whiteboardOpen).toBe(false);
  });
});
