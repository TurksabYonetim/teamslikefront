import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("açıkken başlık ve mesajı gösterir", () => {
    render(
      <ConfirmDialog
        open
        title="Silinsin mi?"
        message="Bu işlem geri alınamaz."
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("Silinsin mi?")).toBeInTheDocument();
    expect(screen.getByText("Bu işlem geri alınamaz.")).toBeInTheDocument();
  });

  it("onayla tıklanınca onConfirm çağrılır", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Sil"
        message="Emin misin?"
        confirmLabel="Sil"
        onConfirm={onConfirm}
        onClose={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Sil" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
