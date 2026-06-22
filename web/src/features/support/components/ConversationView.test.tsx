// web/src/features/support/components/ConversationView.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversationView } from "./ConversationView";
import { conversationStore } from "../conversation.store";
import { ME_ID } from "../support.data";

beforeEach(() => conversationStore.getState().reset());

const get = () => conversationStore.getState();
const conv = (id: string) => get().conversations.find((c) => c.id === id)!;

describe("ConversationView", () => {
  it("aktif konuşmanın mesajlarını gösterir", () => {
    get().setActive("cv1");
    render(<ConversationView />);
    expect(screen.getByText("Bu ayki faturam yanlış görünüyor.")).toBeInTheDocument();
    expect(screen.getByText("Hemen kontrol ediyorum.")).toBeInTheDocument();
  });

  it("yanıt yazıp Enter ile gönderince store'a giden mesaj ekler", () => {
    get().setActive("cv1");
    render(<ConversationView />);
    const before = conv("cv1").messages.length;
    const input = screen.getByPlaceholderText("conversation.replyPlaceholder");
    fireEvent.change(input, { target: { value: "Yeni yanıt" } });
    fireEvent.keyDown(input, { key: "Enter" });
    const msgs = conv("cv1").messages;
    expect(msgs.length).toBe(before + 1);
    expect(msgs.at(-1)).toMatchObject({ direction: "out", body: "Yeni yanıt" });
  });

  it("boş taslakta gönder butonu devre dışı", () => {
    get().setActive("cv1");
    render(<ConversationView />);
    expect(screen.getByLabelText("conversation.send")).toBeDisabled();
  });

  it("/ ile başlayınca canned öneri gösterir", () => {
    get().setActive("cv1");
    render(<ConversationView />);
    const input = screen.getByPlaceholderText("conversation.replyPlaceholder");
    fireEvent.change(input, { target: { value: "/selam" } });
    expect(screen.getByText("/selam")).toBeInTheDocument();
  });

  it("not moduna geçip not eklenince private not olarak kaydeder", () => {
    get().setActive("cv1");
    render(<ConversationView />);
    fireEvent.click(screen.getByLabelText("conversation.noteMode"));
    const input = screen.getByPlaceholderText("conversation.notePlaceholder");
    fireEvent.change(input, { target: { value: "iç not" } });
    fireEvent.keyDown(input, { key: "Enter" });
    const last = conv("cv1").messages.at(-1)!;
    expect(last.authorType).toBe("note");
    expect(last.private).toBe(true);
  });

  it("konuşma seçili değilken boş durum gösterir", () => {
    get().setActive("yok_olmayan_id");
    render(<ConversationView />);
    expect(screen.getByText("conversation.noneTitle")).toBeInTheDocument();
  });

  // ⋯ İşlemler menüsünü açan yardımcı.
  const openActions = () =>
    fireEvent.click(screen.getByRole("button", { name: /işlemler|actions|conversation\.actions/i }));

  it("İşlemler menüsünden durum değiştirir (Çözüldü ↔ Açık)", () => {
    const id = conversationStore.getState().conversations[0].id;
    conversationStore.getState().setActive(id);
    conversationStore.getState().setStatus(id, "open");
    render(<ConversationView />);
    openActions();
    fireEvent.click(screen.getByRole("menuitem", { name: /çözüldü|resolved|status\.resolved/i }));
    expect(conversationStore.getState().conversations.find((c) => c.id === id)!.status).toBe("resolved");
    openActions();
    fireEvent.click(screen.getByRole("menuitem", { name: /^açık$|^open$|status\.open/i }));
    expect(conversationStore.getState().conversations.find((c) => c.id === id)!.status).toBe("open");
  });

  it("İşlemler menüsünden Bana ata konuşmayı ME_ID'ye atar", () => {
    const id = conversationStore.getState().conversations[0].id;
    conversationStore.getState().setActive(id);
    conversationStore.getState().assign(id, "someone_else");
    render(<ConversationView />);
    openActions();
    fireEvent.click(screen.getByRole("menuitem", { name: /bana ata|assign to me|assignToMe/i }));
    expect(conversationStore.getState().conversations.find((c) => c.id === id)!.assigneeId).toBe(ME_ID);
    // Kendine atalıyken "Bana ata" öğesi gizlenir.
    openActions();
    expect(screen.queryByRole("menuitem", { name: /bana ata|assign to me|assignToMe/i })).toBeNull();
  });

  it("İşlemler menüsünden Sıradakine ata bir ajana atar", () => {
    const id = conversationStore.getState().conversations[0].id;
    conversationStore.getState().setActive(id);
    conversationStore.getState().assign(id, "");           // bilinen falsy başlangıç
    render(<ConversationView />);
    openActions();
    fireEvent.click(screen.getByRole("menuitem", { name: /sıradakine|assign next|assignNext/i }));
    const after = conversationStore.getState().conversations.find((c) => c.id === id)!.assigneeId;
    expect(after).toBeTruthy();                              // artık gerçek atama
    expect(after).not.toBe("");
  });
});
