import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StoriesBar } from "./StoriesBar";
import { storiesStore } from "../storiesStore";
import { ME_ID } from "../members";

const S = () => storiesStore.getState();

beforeEach(() => S().reset());

describe("StoriesBar", () => {
  it("renders the seed story authors", () => {
    render(<StoriesBar />);
    expect(screen.getByText(/Defne/)).toBeInTheDocument();
  });

  it("clicking a story marks it seen by me", () => {
    render(<StoriesBar />);
    const unseen = S().stories.find((s) => !s.seenBy.includes(ME_ID))!;
    // story butonu yazar adını içerir
    const btn = screen.getAllByRole("button").find((b) => b.textContent?.includes("Defne"))!;
    fireEvent.click(btn);
    const after = S().stories.find((s) => s.id === unseen.id)!;
    expect(after.seenBy).toContain(ME_ID);
  });
});
