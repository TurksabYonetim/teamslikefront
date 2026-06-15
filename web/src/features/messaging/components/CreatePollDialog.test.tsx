import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreatePollDialog } from "./CreatePollDialog";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("CreatePollDialog", () => {
  it("creates a poll message and closes after submit", () => {
    const onClose = vi.fn();
    render(<CreatePollDialog open onClose={onClose} />);

    const inputs = screen.getAllByRole("textbox");
    // [0] question, [1] option 1, [2] option 2
    fireEvent.change(inputs[0], { target: { value: "Favori renk?" } });
    fireEvent.change(inputs[1], { target: { value: "Mavi" } });
    fireEvent.change(inputs[2], { target: { value: "Yeşil" } });

    fireEvent.click(screen.getByRole("button", { name: /poll\.send|send|gönder/i }));

    const poll = S().messages.find((m) => m.kind === "poll");
    expect(poll).toBeTruthy();
    expect(poll!.poll!.question).toBe("Favori renk?");
    expect(poll!.poll!.options).toHaveLength(2);
    expect(onClose).toHaveBeenCalled();
  });

  it("disables submit until question and 2 options are filled", () => {
    render(<CreatePollDialog open onClose={() => {}} />);
    const send = screen.getByRole("button", { name: /poll\.send|send|gönder/i });
    expect(send).toBeDisabled();
  });
});
