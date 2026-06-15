import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MessageBubble } from "./MessageBubble";
import { messagingStore } from "../store";
import { ME_ID } from "../members";
import type { Message } from "../types";

beforeEach(() => messagingStore.getState().resetStore());

const mk = (over: Partial<Message> = {}): Message => ({
  id: "mt1", channelId: "ch_product", topicId: "tp_product", parentId: null,
  authorId: "usr_2", body: "Merhaba **dünya**", tMinutes: 5, reactions: [], ...over,
});

const renderBubble = (m: Message) =>
  render(<MemoryRouter><MessageBubble message={m} /></MemoryRouter>);

describe("MessageBubble", () => {
  it("renders rich body", () => {
    renderBubble(mk());
    expect(screen.getByText("dünya").tagName).toBe("STRONG");
  });
  it("clicking a quick reaction toggles it in the store", () => {
    const m = mk({ id: "mt2" });
    // mesajı store'a ekle ki toggleReaction etkisini görelim
    messagingStore.setState((s) => ({ messages: [...s.messages, m] }));
    renderBubble(m);
    fireEvent.click(screen.getByRole("button", { name: "👍" }));
    const updated = messagingStore.getState().messages.find((x) => x.id === "mt2")!;
    expect(updated.reactions.some((r) => r.emoji === "👍" && r.userIds.includes(ME_ID))).toBe(true);
  });
  it("shows deleted tombstone", () => {
    renderBubble(mk({ deleted: true, body: "" }));
    expect(screen.getByText(/silindi|deleted/i)).toBeInTheDocument();
  });
  it("own message can enter edit mode and save", () => {
    const m = mk({ id: "mt3", authorId: ME_ID, body: "eski" });
    messagingStore.setState((s) => ({ messages: [...s.messages, m] }));
    renderBubble(m);
    fireEvent.click(screen.getByLabelText(/more|diğer|işlem/i)); // more menu
    fireEvent.click(screen.getByText(/edit|düzenle/i));
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "yeni" } });
    fireEvent.click(screen.getByText(/save|kaydet/i));
    expect(messagingStore.getState().messages.find((x) => x.id === "mt3")!.body).toBe("yeni");
  });

  it("renders a PollMessage for poll-kind messages", () => {
    messagingStore.getState().createPoll("Hangisi?", ["A", "B"], {}, "usr_2");
    const poll = messagingStore.getState().messages.find((m) => m.kind === "poll")!;
    renderBubble(poll);
    expect(screen.getByText("Hangisi?")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders a VoiceMessage for voice-kind messages", () => {
    renderBubble(mk({ id: "mv1", kind: "voice", voiceSec: 9, body: "" }));
    expect(screen.getByText("0:09")).toBeInTheDocument();
  });

  it("renders a FileMessage for file-kind messages", () => {
    renderBubble(mk({ id: "mf1", kind: "file", body: "rapor.pdf", file: { name: "rapor.pdf", fileType: "pdf", sizeKb: 100 } }));
    expect(screen.getByText("rapor.pdf")).toBeInTheDocument();
  });

  it("more menu Forward opens the ForwardDialog", () => {
    const m = mk({ id: "mfw1", body: "gönderilecek" });
    messagingStore.setState((s) => ({ messages: [...s.messages, m] }));
    renderBubble(m);
    fireEvent.click(screen.getByLabelText(/more|diğer|işlem/i));
    fireEvent.click(screen.getByRole("menuitem", { name: /forwardTitle|forward|ilet/i }));
    // ForwardDialog lists targets (engineering channel) excluding the active one
    expect(screen.getByRole("heading", { name: /forwardTitle|forward|ilet/i })).toBeInTheDocument();
    expect(screen.getByText(/engineering/)).toBeInTheDocument();
  });

  it("translate button triggers store.translate", () => {
    const m = mk({ id: "mtr1", body: "hello" });
    messagingStore.setState((s) => ({ messages: [...s.messages, m] }));
    renderBubble(m);
    fireEvent.click(screen.getByRole("button", { name: /translate|çevir/i }));
    expect(messagingStore.getState().messages.find((x) => x.id === "mtr1")!.translating).toBe(true);
  });

  // ── Task 7: Klavye kısayolları ────────────────────────────────────────
  function firstChannelTextMessage() {
    const s = messagingStore.getState();
    const ch = s.channels.find((c) => c.kind !== "dm")!;
    return s.messages.find((m) => m.channelId === ch.id && (!m.kind || m.kind === "text") && !m.deleted)!;
  }

  it("odaktayken 'r' yanıt hedefini ayarlar", () => {
    const msg = firstChannelTextMessage();
    renderBubble(msg);
    const article = screen.getByRole("article");
    article.focus();
    fireEvent.keyDown(article, { key: "r" });
    expect(messagingStore.getState().replyTargetId).toBe(msg.id);
  });

  it("odaktayken 'p' sabitlemeyi değiştirir", () => {
    const msg = firstChannelTextMessage();
    const before = !!messagingStore.getState().messages.find((m) => m.id === msg.id)!.pinned;
    renderBubble(msg);
    const article = screen.getByRole("article");
    article.focus();
    fireEvent.keyDown(article, { key: "p" });
    const after = !!messagingStore.getState().messages.find((m) => m.id === msg.id)!.pinned;
    expect(after).toBe(!before);
  });

  it("'1' ilk hızlı tepkiyi ekler", () => {
    const msg = firstChannelTextMessage();
    renderBubble(msg);
    const article = screen.getByRole("article");
    article.focus();
    fireEvent.keyDown(article, { key: "1" });
    const updated = messagingStore.getState().messages.find((m) => m.id === msg.id)!;
    expect(updated.reactions.some((r) => r.emoji === "👍")).toBe(true);
  });

  it("'Delete' hiçbir şey yapmaz (mesaj silinmez)", () => {
    const msg = firstChannelTextMessage();
    renderBubble(msg);
    const article = screen.getByRole("article");
    article.focus();
    fireEvent.keyDown(article, { key: "Delete" });
    const after = messagingStore.getState().messages.find((m) => m.id === msg.id)!;
    expect(after.deleted).toBeFalsy();
    expect(after.hiddenForMe).toBeFalsy();
  });

  it("'e' non-own mesajda düzenleme açmaz", () => {
    const msg = firstChannelTextMessage(); // non-own (authorId !== ME_ID)
    expect(msg.authorId).not.toBe(ME_ID); // fixture doğrulaması
    renderBubble(msg);
    const article = screen.getByRole("article");
    article.focus();
    fireEvent.keyDown(article, { key: "e", target: article });
    // düzenleme textarea'sı render edilmez
    expect(screen.queryByLabelText(/edit|düzenle/i)).toBeNull();
  });

  // ── Task 8: Tam emoji seçici ─────────────────────────────────────────
  it("emoji seçici toolbar'da mevcut", () => {
    const msg = firstChannelTextMessage();
    render(<MemoryRouter><MessageBubble message={msg} /></MemoryRouter>);
    // EmojiPicker tetikleyicisi aria-label = "emoji" (test env'de t() ham anahtar döndürür)
    expect(screen.getByLabelText(/^emoji$/i)).toBeInTheDocument();
  });

  it("düzenleme textarea'sında yazmak kısayolları tetiklemez", () => {
    const s = messagingStore.getState();
    const own = s.messages.find((m) => m.authorId === ME_ID && (!m.kind || m.kind === "text") && !m.deleted);
    if (!own) return; // own mesaj yoksa atla
    renderBubble(own);
    const article = screen.getByRole("article");
    article.focus();
    fireEvent.keyDown(article, { key: "e", target: article }); // edit moduna gir
    const textarea = screen.getByRole("textbox");
    const before = messagingStore.getState().replyTargetId;
    fireEvent.keyDown(textarea, { key: "r" }); // textarea içinde 'r'
    expect(messagingStore.getState().replyTargetId).toBe(before); // değişmedi
  });
});
