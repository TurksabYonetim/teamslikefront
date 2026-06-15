import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudioView } from "./StudioView";
import { studioStore } from "../studio.store";

beforeEach(() => {
  localStorage.clear();
  studioStore.getState().reset();
});
const get = () => studioStore.getState();
const active = () => get().agents.find((a) => a.id === get().activeAgentId)!;

describe("StudioView", () => {
  it("agent listesini ve aktif agent tasarımını gösterir", () => {
    render(<StudioView />);
    expect(screen.getByText("Destek Konsiyerji")).toBeInTheDocument();
    expect(screen.getByText("studio.intents")).toBeInTheDocument();
    // intent listesi seed'den
    expect(screen.getByText("Fatura sorusu")).toBeInTheDocument();
  });

  it("sandbox'ta eşleşen ifade çözülen yanıt üretir", () => {
    render(<StudioView />);
    const input = screen.getByPlaceholderText("studio.sandboxPh");
    fireEvent.change(input, { target: { value: "fatura sorum var" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Son faturanı çekebilirim — fatura e-postanı doğrular mısın?")).toBeInTheDocument();
    expect(active().metrics.runs).toBeGreaterThan(0);
  });

  it("yeni agent oluşturup yayın engelini gösterir", () => {
    render(<StudioView />);
    const nameInput = screen.getByPlaceholderText("studio.newAgentPh");
    fireEvent.change(nameInput, { target: { value: "Boş Bot" } });
    fireEvent.click(screen.getByRole("button", { name: "studio.create" }));
    expect(active().name).toBe("Boş Bot");
    // hedef/kanal/intent eksik → "tamamla" uyarısı
    expect(screen.getByText(/studio\.missing/)).toBeInTheDocument();
  });

  it("intent ekler", () => {
    render(<StudioView />);
    const before = active().intents.length;
    fireEvent.change(screen.getByPlaceholderText("studio.intentLabelPh"), { target: { value: "Selam" } });
    fireEvent.change(screen.getByPlaceholderText("studio.intentPhrasesPh"), { target: { value: "merhaba, selam" } });
    fireEvent.change(screen.getByPlaceholderText("studio.intentReplyPh"), { target: { value: "Selam!" } });
    fireEvent.click(screen.getByRole("button", { name: /studio\.addIntent/ }));
    expect(active().intents.length).toBe(before + 1);
  });
});
