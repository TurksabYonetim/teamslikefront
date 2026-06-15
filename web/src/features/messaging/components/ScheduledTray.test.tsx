import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScheduledTray } from "./ScheduledTray";
import { messagingStore } from "../store";
import { ME_ID } from "../members";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("ScheduledTray", () => {
  it("lists scheduled messages and sends one now", () => {
    S().scheduleMessage("yarın gönder", ME_ID);
    const id = S().messages.at(-1)!.id;
    render(<ScheduledTray open onClose={() => {}} />);

    expect(screen.getByText("yarın gönder")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /sendNow|şimdi|now/i }));

    expect(S().messages.find((m) => m.id === id)!.scheduled).toBe(false);
  });

  it("shows empty state when no scheduled messages", () => {
    render(<ScheduledTray open onClose={() => {}} />);
    expect(screen.getByText(/scheduledEmpty|zamanlanmış yok|no scheduled/i)).toBeInTheDocument();
  });
});
