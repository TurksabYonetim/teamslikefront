import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SmartReplies } from "./SmartReplies";

describe("SmartReplies", () => {
  it("renders suggestion chips and picks one", () => {
    const onPick = vi.fn();
    render(<SmartReplies onPick={onPick} />);
    const chips = screen.getAllByRole("button");
    expect(chips.length).toBeGreaterThan(0);
    fireEvent.click(chips[0]);
    expect(onPick).toHaveBeenCalledOnce();
  });
});
