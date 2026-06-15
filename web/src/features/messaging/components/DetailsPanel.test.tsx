import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetailsPanel } from "./DetailsPanel";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("DetailsPanel", () => {
  it("shows the active channel name", () => {
    render(<DetailsPanel />);
    expect(screen.getAllByText(/product/i).length).toBeGreaterThan(0);
  });

  it("clicking the 24h disappearing button updates the store", () => {
    render(<DetailsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /timer\.24h|^24h$/i }));
    expect(S().channels.find((c) => c.id === S().activeChannelId)!.disappearing).toBe("24h");
  });
});
