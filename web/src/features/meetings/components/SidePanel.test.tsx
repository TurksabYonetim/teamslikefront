import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidePanel } from "./SidePanel";
import { meetingStore } from "../meetings.store";
import { messagingStore } from "@/features/messaging/store";

const renderPanel = () =>
  render(
    <MemoryRouter>
      <SidePanel />
    </MemoryRouter>,
  );

beforeEach(() => {
  meetingStore.getState().resetStore();
  messagingStore.getState().resetStore();
});

describe("SidePanel", () => {
  it("is hidden when sidePanel is none", () => {
    const { container } = renderPanel();
    expect(container.firstChild).toBeNull();
  });

  it("participants tab lists participants and lobby admit", () => {
    meetingStore.getState().setSidePanel("participants");
    renderPanel();
    expect(screen.getByText(/Defne/)).toBeInTheDocument();
    expect(screen.getByText(/Jordan/)).toBeInTheDocument(); // lobby
    expect(screen.getByRole("button", { name: /admit|kabul/i })).toBeInTheDocument();
  });

  it("chat tab sends a message", () => {
    meetingStore.getState().setSidePanel("chat");
    renderPanel();
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "selam" } });
    const before = meetingStore.getState().chat.length;
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(meetingStore.getState().chat.length).toBe(before + 1);
  });

  it("captions tab toggles captions", () => {
    meetingStore.getState().setSidePanel("captions");
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /captions|altyaz/i }));
    expect(meetingStore.getState().captionsOn).toBe(true);
  });

  it("linked chat reads from the bound channel and posts there", () => {
    // Bind the meeting to a real messaging channel/topic.
    meetingStore.getState().startFromChannel("ch_product", "tp_product", "Standup");
    meetingStore.getState().setSidePanel("chat");
    renderPanel();

    // Existing channel messages are surfaced inside the meeting chat tab.
    expect(screen.getByText(/release-notes/i)).toBeInTheDocument();

    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "köprüden mesaj" } });
    fireEvent.keyDown(ta, { key: "Enter" });

    // It lands in the linked channel, not the in-meeting chat buffer.
    expect(
      messagingStore.getState().messages.some(
        (m) => m.topicId === "tp_product" && m.body === "köprüden mesaj",
      ),
    ).toBe(true);
  });

  it("shows an Open full chat shortcut when linked", () => {
    meetingStore.getState().startFromChannel("ch_product", "tp_product", "Standup");
    meetingStore.getState().setSidePanel("chat");
    renderPanel();
    expect(
      screen.getByRole("button", { name: /openFullChat|full chat|tam sohbet/i }),
    ).toBeInTheDocument();
  });
});
