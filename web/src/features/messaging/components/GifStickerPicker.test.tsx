import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GifStickerPicker } from "./GifStickerPicker";

describe("GifStickerPicker", () => {
  it("sends a sticker on click", () => {
    const onSend = vi.fn();
    render(<GifStickerPicker onSend={onSend} />);
    fireEvent.click(screen.getByLabelText(/sticker|gif/i));
    fireEvent.click(screen.getByRole("button", { name: "🎉" }));
    expect(onSend).toHaveBeenCalledWith("🎉");
  });
});
