import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("GlobalSearchDialog", () => {
  it("lists matching messages and jumps on click", () => {
    const onClose = vi.fn();
    // Move active channel away from ch_product so we can verify the jump.
    S().setChannel("ch_eng");
    render(<GlobalSearchDialog open onClose={onClose} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Sprint" } });
    const hit = screen.getByRole("option", { name: /Sprint/i });
    fireEvent.click(within(hit).getByRole("button"));

    expect(S().activeChannelId).toBe("ch_product");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows a hint when query is empty", () => {
    render(<GlobalSearchDialog open onClose={() => {}} />);
    // t() returns raw key in test env; "palette.hint" contains "hint"
    expect(screen.getByText(/atlamak için yazın|type to jump|palette\.hint/i)).toBeInTheDocument();
  });

  it("kanal adıyla filtreleyip Enter ile o kanala atlar", () => {
    const channels = messagingStore.getState().channels;
    const target = channels.find((c) => c.kind !== "dm")!;
    render(<GlobalSearchDialog open onClose={() => {}} />);

    // getByRole("combobox") works regardless of i18n key resolution
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: target.name.slice(0, 3) } });

    const option = screen.getByText(target.name);
    expect(option).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(messagingStore.getState().activeChannelId).toBe(target.id);
  });
});
