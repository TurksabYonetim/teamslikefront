import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShortcutsHelpDialog } from "./ShortcutsHelpDialog";

it("açıkken kısayolları listeler", () => {
  render(<ShortcutsHelpDialog open onClose={() => {}} />);
  expect(screen.getByText(/klavye kısayolları|keyboard shortcuts|shortcuts\.title/i)).toBeInTheDocument();
  // mesaj aksiyon tuşlarından biri görünür (kbd)
  expect(screen.getByText("r")).toBeInTheDocument();
});

it("kapalıyken render etmez", () => {
  render(<ShortcutsHelpDialog open={false} onClose={() => {}} />);
  expect(screen.queryByText(/klavye kısayolları|keyboard shortcuts|shortcuts\.title/i)).not.toBeInTheDocument();
});
