// web/src/features/support/components/KbPanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KbPanel } from "./KbPanel";

describe("KbPanel", () => {
  it("tüm makaleleri listeler ve aramayla filtreler", () => {
    render(<KbPanel />);
    expect(screen.getByText("Yanlış faturayı düzeltme")).toBeInTheDocument();
    expect(screen.getByText("Planınızı yükseltme")).toBeInTheDocument();

    const search = screen.getByPlaceholderText("kb.search");
    fireEvent.change(search, { target: { value: "500" } });
    expect(screen.getByText("Dışa aktarma 500 hatası")).toBeInTheDocument();
    expect(screen.queryByText("Planınızı yükseltme")).not.toBeInTheDocument();
    expect(screen.queryByText("Yanlış faturayı düzeltme")).not.toBeInTheDocument();
  });

  it("makaleye tıklayınca gövdesini açar (akordeon)", () => {
    render(<KbPanel />);
    const title = screen.getByText("Planınızı yükseltme");
    expect(screen.queryByText(/Ayarlar → Faturalama/)).not.toBeInTheDocument();
    fireEvent.click(title);
    expect(screen.getByText(/Ayarlar → Faturalama/)).toBeInTheDocument();
  });

  it("eşleşme yoksa boş durum gösterir", () => {
    render(<KbPanel />);
    fireEvent.change(screen.getByPlaceholderText("kb.search"), { target: { value: "zzzqqq" } });
    expect(screen.getByText("kb.empty")).toBeInTheDocument();
  });
});
