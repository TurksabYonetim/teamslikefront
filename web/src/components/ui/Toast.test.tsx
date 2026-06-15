import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

function Trigger() {
  const toast = useToast();
  return (
    <button onClick={() => toast.show({ message: "Kaydedildi" })}>göster</button>
  );
}

describe("Toast", () => {
  it("show çağrısıyla mesaj görünür", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText("göster"));
    expect(screen.getByText("Kaydedildi")).toBeInTheDocument();
  });

  it("undo aksiyonu tıklanınca callback çalışır", async () => {
    const onUndo = vi.fn();
    function UndoTrigger() {
      const toast = useToast();
      return (
        <button onClick={() => toast.show({ message: "Silindi", action: { label: "Geri al", onClick: onUndo } })}>
          sil
        </button>
      );
    }
    render(
      <ToastProvider>
        <UndoTrigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText("sil"));
    await userEvent.click(screen.getByText("Geri al"));
    expect(onUndo).toHaveBeenCalledOnce();
  });
});
