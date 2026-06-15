import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PollMessage } from "./PollMessage";
import { messagingStore } from "../store";
import { ME_ID } from "../members";
import type { Message } from "../types";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

const pollMsg = (): Message => {
  S().createPoll("Hangisi?", ["Alfa", "Beta"], {}, "usr_2");
  return S().messages.find((m) => m.kind === "poll")!;
};

describe("PollMessage", () => {
  it("renders the question and options", () => {
    render(<PollMessage message={pollMsg()} />);
    expect(screen.getByText("Hangisi?")).toBeInTheDocument();
    expect(screen.getByText("Alfa")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("voting increments the option in the store and shows a percentage", () => {
    const m = pollMsg();
    render(<PollMessage message={m} />);
    fireEvent.click(screen.getByText("Alfa"));
    const updated = S().messages.find((x) => x.id === m.id)!.poll!;
    expect(updated.options[0].votes).toContain(ME_ID);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});
