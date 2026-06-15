import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ForwardDialog } from "./ForwardDialog";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("ForwardDialog", () => {
  it("forwards the message to the chosen channel and closes", () => {
    const onClose = vi.fn();
    // active channel is ch_product; forward m1 to engineering.
    render(<ForwardDialog open onClose={onClose} messageId="m1" />);

    const beforeEng = S().messages.filter((m) => m.channelId === "ch_eng").length;
    fireEvent.click(screen.getByRole("button", { name: /engineering/i }));

    expect(S().messages.filter((m) => m.channelId === "ch_eng").length).toBe(beforeEng + 1);
    const last = S().messages.filter((m) => m.channelId === "ch_eng").at(-1)!;
    expect(last.forwardedFrom).toBeTruthy();
    expect(onClose).toHaveBeenCalled();
  });

  it("does not list the active channel as a target", () => {
    render(<ForwardDialog open onClose={() => {}} messageId="m1" />);
    // ch_product (#product) is active → excluded
    expect(screen.queryByRole("button", { name: /^#product$/ })).not.toBeInTheDocument();
  });
});
