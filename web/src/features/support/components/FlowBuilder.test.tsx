import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlowBuilder } from "./FlowBuilder";
import { botflowStore, activeFlow } from "../botflow.store";

beforeEach(() => {
  localStorage.clear();
  botflowStore.getState().reset();
});

describe("FlowBuilder", () => {
  it("aktif akışın düğümlerini listeler", () => {
    render(<FlowBuilder />);
    expect(screen.getByText("Merhaba! Bugün nasıl yardımcı olabiliriz?")).toBeInTheDocument();
    expect(screen.getByText("flow.start")).toBeInTheDocument();
    // collect düğümü WhatsApp Flow rozeti taşır
    expect(screen.getAllByText("flow.waFlow").length).toBeGreaterThan(0);
  });

  it("simülasyon başlat→bitiş yolunu gösterir", () => {
    render(<FlowBuilder />);
    fireEvent.click(screen.getByRole("button", { name: /flow\.simulate/ }));
    // path satırı (aria-live) varsayılan ilk seçenekle (Fatura) dolaşır → VIP değil → topla → handoff
    expect(screen.getByText(/flow\.path/)).toBeInTheDocument();
  });

  it("düğüm ekler", () => {
    render(<FlowBuilder />);
    const before = activeFlow(botflowStore.getState()).nodes.length;
    // "Mesaj" ekle butonu (flow.kind.message etiketi)
    const addButtons = screen.getAllByText("flow.kind.message");
    // En azından bir tane buton; ilkine tıkla (badge'ler de aynı metni taşıyabilir, role=button filtrele)
    const btn = addButtons.map((el) => el.closest("button")).find(Boolean)!;
    fireEvent.click(btn);
    expect(activeFlow(botflowStore.getState()).nodes.length).toBe(before + 1);
  });
});
