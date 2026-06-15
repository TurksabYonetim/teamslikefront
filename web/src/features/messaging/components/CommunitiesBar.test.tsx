import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { CommunitiesBar } from "./CommunitiesBar";
import { communitiesStore } from "../communitiesStore";
import { messagingStore } from "../store";

beforeEach(() => {
  communitiesStore.getState().reset();
  messagingStore.getState().resetStore();
});

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="loc">{loc.pathname}</div>;
}

function renderBar(initial = "/channels") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <CommunitiesBar />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("CommunitiesBar", () => {
  it("selecting a community jumps to its first channel", () => {
    renderBar();
    // 'Engineering' kısaltması 'EN'
    fireEvent.click(screen.getByRole("button", { name: "Engineering" }));
    expect(communitiesStore.getState().activeCommunityId).toBe("cm_eng");
    expect(messagingStore.getState().activeChannelId).toBe("ch_eng");
  });

  it("grid (home) button navigates to the app home", () => {
    renderBar("/channels");
    expect(screen.getByTestId("loc").textContent).toBe("/channels");
    fireEvent.click(screen.getByTestId("community-home"));
    expect(screen.getByTestId("loc").textContent).toBe("/");
  });
});
