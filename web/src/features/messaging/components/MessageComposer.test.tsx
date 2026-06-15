import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToastProvider } from "@/components/ui";
import { MessageComposer } from "./MessageComposer";
import { messagingStore } from "../store";
import { ME_ID } from "../members";

beforeEach(() => messagingStore.getState().resetStore());

const renderComposer = () =>
  render(
    <ToastProvider>
      <MessageComposer />
    </ToastProvider>,
  );

describe("MessageComposer", () => {
  it("typing updates the draft and send appends a message", () => {
    renderComposer();
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "selam" } });
    expect(messagingStore.getState().draftsByTopic[messagingStore.getState().activeTopicId]).toBe("selam");
    const before = messagingStore.getState().messages.length;
    fireEvent.click(screen.getByRole("button", { name: /send|gönder/i }));
    expect(messagingStore.getState().messages.length).toBe(before + 1);
    const last = messagingStore.getState().messages.at(-1)!;
    expect(last.body).toBe("selam");
    expect(last.authorId).toBe(ME_ID);
  });
  it("Enter sends, Shift+Enter does not", () => {
    renderComposer();
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "abc" } });
    const before = messagingStore.getState().messages.length;
    fireEvent.keyDown(ta, { key: "Enter", shiftKey: true });
    expect(messagingStore.getState().messages.length).toBe(before);
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(messagingStore.getState().messages.length).toBe(before + 1);
  });
  it("send button is disabled when empty", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: /send|gönder/i })).toBeDisabled();
  });

  it("typing @ shows a member suggestion and clicking inserts @Name", () => {
    renderComposer();
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "merhaba @Def" } });
    const suggestion = screen.getByRole("button", { name: /Defne Yıldız/ });
    fireEvent.click(suggestion);
    const draft = messagingStore.getState().draftsByTopic[messagingStore.getState().activeTopicId];
    expect(draft).toContain("@Defne Yıldız");
  });

  it("poll button opens CreatePollDialog", () => {
    renderComposer();
    expect(screen.queryByRole("heading", { name: /poll\.create|anket oluştur|create poll/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /poll\.create|anket|create poll|poll$/i }));
    expect(screen.getByRole("heading", { name: /poll\.create|anket oluştur|create poll/i })).toBeInTheDocument();
  });

  it("AI rewrite transforms the draft via the Sparkle menu", () => {
    renderComposer();
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "hello there" } });
    fireEvent.click(screen.getByRole("button", { name: /ai\.menu|ai writing|ai yazım/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /professional|profesyonel/i }));
    const draft = messagingStore.getState().draftsByTopic[messagingStore.getState().activeTopicId];
    expect(draft).toBe("Hello there.");
  });

  it("canned responses insert a body into the draft", () => {
    renderComposer();
    fireEvent.click(screen.getByRole("button", { name: /canned|hazır yanıt/i }));
    const items = screen.getAllByRole("menuitem");
    fireEvent.click(items[0]);
    const draft = messagingStore.getState().draftsByTopic[messagingStore.getState().activeTopicId];
    expect(draft.length).toBeGreaterThan(0);
  });
});
