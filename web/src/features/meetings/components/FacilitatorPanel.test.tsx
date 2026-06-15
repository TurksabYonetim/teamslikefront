import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FacilitatorPanel } from "./FacilitatorPanel";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("FacilitatorPanel", () => {
  it("renders the agenda title and advances elapsed time", () => {
    render(<FacilitatorPanel />);
    expect(
      screen.getByRole("heading", { name: /facilitator\.title|Facilitator|Kolaylaştırıcı/i }),
    ).toBeInTheDocument();
    // fwd butonu elapsed'i artırır → 0/30 → 5/30 (metin değişir); en azından buton var
    const fwd = screen.getByRole("button", { name: /fwd|ileri|next/i });
    expect(fwd).toBeInTheDocument();
    fireEvent.click(fwd);
    expect(screen.getByText(/^5\//)).toBeInTheDocument();
  });
});
