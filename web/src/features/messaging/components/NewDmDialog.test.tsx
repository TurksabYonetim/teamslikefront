import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NewDmDialog } from "./NewDmDialog";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("NewDmDialog", () => {
  it("selecting a member and starting creates a dm channel", () => {
    const onClose = vi.fn();
    render(<NewDmDialog open onClose={onClose} />);
    const before = S().channels.length;

    fireEvent.click(screen.getByRole("button", { name: /Defne Yıldız/ }));
    fireEvent.click(screen.getByRole("button", { name: /startDm|startGroupDm|DM/i }));

    expect(S().channels.length).toBe(before + 1);
    const created = S().channels.find((c) => c.id === S().activeChannelId)!;
    expect(created.kind).toBe("dm");
    expect(created.dmUserId).toBe("usr_2");
    expect(onClose).toHaveBeenCalled();
  });

  it("does not list the current user", () => {
    render(<NewDmDialog open onClose={() => {}} />);
    expect(screen.queryByRole("button", { name: /^Siz$/ })).not.toBeInTheDocument();
  });
});
