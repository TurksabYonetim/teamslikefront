import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PinnedBar } from "./PinnedBar";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

describe("PinnedBar", () => {
  it("renders nothing when no pinned message in active topic", () => {
    const { container } = render(<PinnedBar />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the bar after a message in the active topic is pinned", () => {
    const topicId = S().activeTopicId;
    const m = S().messages.find((x) => x.topicId === topicId)!;
    S().togglePin(m.id);
    render(<PinnedBar />);
    expect(screen.getByText(/pinnedMessage|pinned/i)).toBeInTheDocument();
  });
});
