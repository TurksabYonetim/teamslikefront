import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessagingSidebar } from "./MessagingSidebar";
import { messagingStore } from "../store";

beforeEach(() => messagingStore.getState().resetStore());

describe("MessagingSidebar", () => {
  it("lists channels and DMs and selects on click", () => {
    render(<MessagingSidebar />);
    fireEvent.click(screen.getByText("engineering"));
    expect(messagingStore.getState().activeChannelId).toBe("ch_eng");
  });
  it("folder tab 'dms' filters to DMs only", () => {
    render(<MessagingSidebar />);
    fireEvent.click(screen.getByRole("tab", { name: /dm/i }));
    expect(messagingStore.getState().folder).toBe("dms");
    expect(screen.queryByText("engineering")).not.toBeInTheDocument();
    expect(screen.getByText("Defne Yıldız")).toBeInTheDocument();
  });
  it("clicking the saved button opens the SavedDrawer", () => {
    render(<MessagingSidebar />);
    // dialog/modal heading not present yet
    expect(screen.queryByRole("heading", { name: /^savedTitle$|^kaydedilenler$|^saved$/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^savedTitle$|^kaydedilenler$|^saved$/i }));
    expect(screen.getByRole("heading", { name: /^savedTitle$|^kaydedilenler$|^saved$/i })).toBeInTheDocument();
  });
});
