import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageInfoDialog } from "./MessageInfoDialog";
import type { Message } from "../types";

const mk = (over: Partial<Message> = {}): Message => ({
  id: "mi1",
  channelId: "ch_product",
  topicId: "tp_product",
  parentId: null,
  authorId: "usr_1",
  body: "info gövdesi",
  tMinutes: 4,
  reactions: [],
  ...over,
});

describe("MessageInfoDialog", () => {
  it("renders the message body and at least one recipient row", () => {
    render(<MessageInfoDialog open onClose={() => {}} message={mk()} />);
    expect(screen.getByText("info gövdesi")).toBeInTheDocument();
    // a recipient other than the author should appear
    expect(screen.getByText("Defne Yıldız")).toBeInTheDocument();
  });
});
