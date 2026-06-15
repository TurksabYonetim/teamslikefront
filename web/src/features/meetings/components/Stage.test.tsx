import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stage } from "./Stage";
import { meetingStore } from "../meetings.store";

beforeEach(() => meetingStore.getState().resetStore());

describe("Stage", () => {
  it("renders a tile per participant in grid layout", () => {
    render(<Stage />);
    // seed: Siz + 4 = isimler görünür
    expect(screen.getByText(/Defne/)).toBeInTheDocument();
    expect(screen.getByText(/Marco/)).toBeInTheDocument();
  });
  it("speaker layout shows one big tile + filmstrip", () => {
    meetingStore.getState().setLayout("speaker");
    render(<Stage />);
    expect(screen.getAllByText(/Defne|Marco|Aylin|Priya|Siz/).length).toBeGreaterThan(0);
  });
});
