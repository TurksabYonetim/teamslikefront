import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SavedDrawer } from "./SavedDrawer";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("SavedDrawer", () => {
  it("lists saved messages and navigates on click", () => {
    const onClose = vi.fn();
    // m1 lives in ch_product; save it.
    S().toggleSave("m1");
    S().setChannel("ch_eng");
    render(<SavedDrawer open onClose={onClose} />);

    const hit = screen.getByText(/Sprint/i);
    fireEvent.click(hit);

    expect(S().activeChannelId).toBe("ch_product");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows empty state when nothing is saved", () => {
    render(<SavedDrawer open onClose={() => {}} />);
    expect(screen.getByText(/savedEmpty|kaydedilen yok|no saved/i)).toBeInTheDocument();
  });
});
