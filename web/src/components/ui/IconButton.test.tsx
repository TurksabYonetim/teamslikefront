import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("uses label as accessible name and fires onClick", async () => {
    const onClick = vi.fn();
    render(<IconButton label="Ara" onClick={onClick}><svg /></IconButton>);
    const btn = screen.getByRole("button", { name: "Ara" });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("marks primary variant via aria-pressed", () => {
    render(<IconButton label="Detay" variant="primary"><svg /></IconButton>);
    expect(screen.getByRole("button", { name: "Detay" })).toHaveAttribute("aria-pressed", "true");
  });
});
