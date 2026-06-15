// web/src/features/support/components/ContactPanel.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactPanel } from "./ContactPanel";
import { conversationStore } from "../conversation.store";

beforeEach(() => conversationStore.getState().reset());

const get = () => conversationStore.getState();
const conv = (id: string) => get().conversations.find((c) => c.id === id)!;

describe("ContactPanel", () => {
  it("kişi adı + kimlik bilgilerini gösterir", () => {
    get().setActive("cv1");
    render(<ContactPanel />);
    expect(screen.getByText("Jordan Blake")).toBeInTheDocument();
    expect(screen.getByText("jordan@acme.com")).toBeInTheDocument();
  });

  it("etiket ekleyip Enter ile kaydeder ve siler", () => {
    get().setActive("cv3"); // cv3 etiketsiz başlar
    render(<ContactPanel />);
    const input = screen.getByPlaceholderText("contact.addLabel");
    fireEvent.change(input, { target: { value: "vip" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(conv("cv3").labels).toContain("vip");
    // tek etiket → tek sil butonu
    fireEvent.click(screen.getByLabelText("contact.removeLabel"));
    expect(conv("cv3").labels).not.toContain("vip");
  });

  it("CSAT yıldızına tıklayınca puan kaydeder (4. yıldız → 4)", () => {
    get().setActive("cv1");
    render(<ContactPanel />);
    const stars = screen.getAllByLabelText("contact.csatRate");
    fireEvent.click(stars[3]);
    expect(conv("cv1").csat).toBe(4);
  });

  it("aktif konuşma yoksa hiçbir şey render etmez", () => {
    get().setActive("yok");
    const { container } = render(<ContactPanel />);
    expect(container.firstChild).toBeNull();
  });
});
