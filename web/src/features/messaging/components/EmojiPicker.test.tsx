import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmojiPicker } from "./EmojiPicker";

describe("EmojiPicker", () => {
  it("opens and calls onPick", () => {
    const onPick = vi.fn();
    render(<EmojiPicker onPick={onPick} />);
    fireEvent.click(screen.getByLabelText(/emoji/i));
    fireEvent.click(screen.getByRole("button", { name: "😀" }));
    expect(onPick).toHaveBeenCalledWith("😀");
  });
});
