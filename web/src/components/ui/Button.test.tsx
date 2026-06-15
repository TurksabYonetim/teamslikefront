import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("çocuk içeriği render eder", () => {
    render(<Button>Kaydet</Button>);
    expect(screen.getByRole("button", { name: "Kaydet" })).toBeInTheDocument();
  });

  it("tıklamayı iletir", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tıkla</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("loading durumunda devre dışıdır ve spinner gösterir", () => {
    render(<Button loading>Gönder</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector("span.animate-spin")).toBeTruthy();
  });

  it("danger variant kırmızı sınıf alır", () => {
    render(<Button variant="danger">Sil</Button>);
    expect(screen.getByRole("button").className).toContain("bg-danger");
  });
});
