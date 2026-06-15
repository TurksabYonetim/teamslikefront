import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("CreateChannelDialog", () => {
  it("creates a channel (slugged) and closes after submit", () => {
    const onClose = vi.fn();
    render(<CreateChannelDialog open onClose={onClose} />);
    const before = S().channels.length;

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "My Team" } });
    fireEvent.click(screen.getByRole("button", { name: /^create$|^oluştur$/i }));

    expect(S().channels.length).toBe(before + 1);
    const created = S().channels.find((c) => c.id === S().activeChannelId)!;
    expect(created.name).toBe("my-team");
    expect(onClose).toHaveBeenCalled();
  });

  it("disables submit when name empty", () => {
    render(<CreateChannelDialog open onClose={() => {}} />);
    expect(screen.getByRole("button", { name: /^create$|^oluştur$/i })).toBeDisabled();
  });
});
