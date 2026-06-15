import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EngagePanel } from "./EngagePanel";
import { meetingStore } from "../meetings.store";
import { intelStore } from "@/features/intelligence/intel.store";

const renderPanel = () =>
  render(
    <MemoryRouter>
      <EngagePanel />
    </MemoryRouter>,
  );

beforeEach(() => {
  meetingStore.getState().resetStore();
  intelStore.getState().resetStore();
});

describe("EngagePanel", () => {
  it("is hidden unless sidePanel is engage", () => {
    const { container } = renderPanel();
    expect(container.firstChild).toBeNull();
  });

  it("launches a poll (host) and shows it", () => {
    meetingStore.getState().setSidePanel("engage");
    renderPanel();
    // host self → create form visible (distinct poll placeholder)
    const qInput = screen.getByPlaceholderText("poll.questionPh");
    fireEvent.change(qInput, { target: { value: "Hangi gün?" } });
    const opts = screen.getAllByPlaceholderText(/option|seçenek/i);
    fireEvent.change(opts[0], { target: { value: "Cuma" } });
    fireEvent.change(opts[1], { target: { value: "Pzt" } });
    fireEvent.click(screen.getByRole("button", { name: /launch|başlat|poll\.launch/i }));
    expect(meetingStore.getState().meetingPoll).not.toBeNull();
    expect(meetingStore.getState().meetingPoll?.options).toHaveLength(2);
  });

  it("votes on a poll and computes percentage", () => {
    meetingStore.getState().setSidePanel("engage");
    meetingStore.getState().launchPoll("Q?", ["A", "B"]);
    renderPanel();
    const optionButtons = screen
      .getAllByRole("button")
      .filter((b) => /A|B/.test(b.textContent ?? ""));
    fireEvent.click(optionButtons[0]);
    const opt = meetingStore.getState().meetingPoll?.options[0];
    expect(opt?.votes).toContain("usr_1");
  });

  it("asks a question", () => {
    meetingStore.getState().setSidePanel("engage");
    renderPanel();
    const input = screen.getByPlaceholderText("qnaPlaceholder");
    const before = meetingStore.getState().qna.length;
    fireEvent.change(input, { target: { value: "Kayıt var mı?" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(meetingStore.getState().qna.length).toBe(before + 1);
  });

  it("opens Intelligence with the standup source", () => {
    meetingStore.getState().setSidePanel("engage");
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /openIntelligence|intelligence|intelligence'ta/i }));
    expect(intelStore.getState().activeSourceId).toBe("src_standup");
  });
});
