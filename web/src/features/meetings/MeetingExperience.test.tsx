import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MeetingExperience } from "./MeetingExperience";
import { meetingStore } from "./meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

const renderExp = () =>
  render(
    <MemoryRouter>
      <MeetingExperience />
    </MemoryRouter>,
  );

describe("MeetingExperience", () => {
  it("shows the room when phase is in (seed default)", () => {
    renderExp();
    expect(screen.getByTestId("meeting-room")).toBeInTheDocument();
  });
  it("leave returns to idle landing", () => {
    renderExp();
    fireEvent.click(screen.getByRole("button", { name: /Ayrıl|leave/i }));
    expect(screen.getByTestId("meeting-landing")).toBeInTheDocument();
  });
  it("prejoin → join shows the room", () => {
    meetingStore.getState().openPrejoin("mtg_x", "Test");
    renderExp();
    expect(screen.getByTestId("meeting-prejoin")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /joinNow|join now|şimdi katıl/i }));
    expect(screen.getByTestId("meeting-room")).toBeInTheDocument();
  });
});
