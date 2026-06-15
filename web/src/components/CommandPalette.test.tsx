import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";

function setup(open = true) {
  const onClose = vi.fn();
  render(
    <MemoryRouter>
      <CommandPalette open={open} onClose={onClose} />
    </MemoryRouter>,
  );
  return { onClose };
}

describe("CommandPalette", () => {
  it("kapalıyken hiçbir şey render etmez", () => {
    setup(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("açıkken navigasyon öğelerini listeler", () => {
    setup(true);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Ana sayfa/i })).toBeInTheDocument();
  });

  it("sorguya göre filtreler", async () => {
    setup(true);
    await userEvent.type(screen.getByLabelText("Sayfa ara"), "ayar");
    expect(screen.getByRole("option", { name: /Ayarlar/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Ana sayfa/i }),
    ).not.toBeInTheDocument();
  });

  it("eşleşme yoksa 'Sonuç yok' gösterir", async () => {
    setup(true);
    await userEvent.type(screen.getByLabelText("Sayfa ara"), "zzzzz");
    expect(screen.getByText("Sonuç yok")).toBeInTheDocument();
  });
});
