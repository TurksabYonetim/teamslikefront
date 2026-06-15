import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MessageList } from "./MessageList";
import { messagingStore } from "../store";

beforeEach(() => {
  vi.useFakeTimers();
  messagingStore.getState().resetStore();
});
afterEach(() => vi.useRealTimers());

// İlk yükleme iskeleti 360ms sonra kapanır — render edip zamanlayıcıyı ilerlet.
const renderList = () => {
  const utils = render(<MemoryRouter><MessageList /></MemoryRouter>);
  act(() => {
    vi.advanceTimersByTime(400);
  });
  return utils;
};

describe("MessageList", () => {
  it("renders messages for the active topic", () => {
    // seed aktif kanal ch_product / tp_product
    renderList();
    expect(screen.getByText(/Sprint plan/i)).toBeInTheDocument();
  });
  it("filters by search", () => {
    messagingStore.getState().setSearch("changelog");
    renderList();
    expect(screen.getByText(/changelog/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sprint plan/i)).not.toBeInTheDocument();
  });
  it("shows empty state when saved-only and nothing saved", () => {
    messagingStore.getState().toggleSavedOnly();
    renderList();
    expect(screen.getByText(/no|yok|boş|empty/i)).toBeInTheDocument();
  });
});
