import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Force the permission guard to deny access for this whole file.
vi.mock("@/lib/authStore", () => ({
  useCan: () => false,
}));

import { MeetingExperience } from "./MeetingExperience";
import { meetingStore } from "./meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("MeetingExperience permission guard", () => {
  it("renders Forbidden instead of the room when meetings.view is denied", () => {
    render(
      <MemoryRouter>
        <MeetingExperience />
      </MemoryRouter>,
    );
    // The room/landing/prejoin surfaces must not render.
    expect(screen.queryByTestId("meeting-room")).toBeNull();
    expect(screen.queryByTestId("meeting-landing")).toBeNull();
    expect(screen.queryByTestId("meeting-prejoin")).toBeNull();
    // Forbidden uses role="alert".
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
