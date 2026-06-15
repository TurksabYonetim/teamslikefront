import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VoiceMessage } from "./VoiceMessage";

describe("VoiceMessage", () => {
  it("renders a 15-bar waveform and the duration", () => {
    const { container } = render(<VoiceMessage seconds={7} seed="m1" />);
    expect(screen.getByText("0:07")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-bar]")).toHaveLength(15);
  });

  it("toggles play/pause", () => {
    render(<VoiceMessage seconds={65} seed="m2" />);
    // raw key fallback: voice.play
    const play = screen.getByRole("button", { name: /voice\.play|play/i });
    fireEvent.click(play);
    expect(screen.getByRole("button", { name: /voice\.pause|pause/i })).toBeInTheDocument();
  });

  it("formats minutes and seconds", () => {
    render(<VoiceMessage seconds={65} seed="m3" />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });
});
