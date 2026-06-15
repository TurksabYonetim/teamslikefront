import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TypingIndicator } from "./TypingIndicator";
import { messagingStore } from "../store";

beforeEach(() => {
  messagingStore.getState().resetStore();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("TypingIndicator", () => {
  it("is hidden initially and appears after the delay", () => {
    render(<TypingIndicator />);
    expect(screen.queryByText(/typing|yazıyor/i)).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText(/typing|yazıyor/i)).toBeInTheDocument();
  });
});
