import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BreakoutManager } from "./BreakoutManager";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("BreakoutManager", () => {
  it("creates breakout rooms on click", () => {
    render(<BreakoutManager open onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /2/ }));
    expect(meetingStore.getState().breakouts).toHaveLength(2);
  });
});
