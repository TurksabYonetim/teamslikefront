import { render, fireEvent } from "@testing-library/react";
import { it, expect, vi, beforeEach } from "vitest";
import { useMessagingHotkeys } from "./useMessagingHotkeys";
import { messagingStore } from "../store";

function Harness({ onHelp }: { onHelp: () => void }) {
  useMessagingHotkeys({ onOpenHelp: onHelp });
  return <textarea aria-label="ta" />;
}

beforeEach(() => messagingStore.getState().resetStore());

it("Ctrl+K paleti açar", () => {
  render(<Harness onHelp={() => {}} />);
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  expect(messagingStore.getState().paletteOpen).toBe(true);
});

it("⌘K (metaKey) paleti açar", () => {
  render(<Harness onHelp={() => {}} />);
  fireEvent.keyDown(document, { key: "k", metaKey: true });
  expect(messagingStore.getState().paletteOpen).toBe(true);
});

it("? yazma alanı dışındayken yardımı açar", () => {
  const onHelp = vi.fn();
  render(<Harness onHelp={onHelp} />);
  fireEvent.keyDown(document, { key: "?" });
  expect(onHelp).toHaveBeenCalledTimes(1);
});

it("? textarea içinde yardımı AÇMAZ", () => {
  const onHelp = vi.fn();
  const { getByLabelText } = render(<Harness onHelp={onHelp} />);
  fireEvent.keyDown(getByLabelText("ta"), { key: "?" });
  expect(onHelp).not.toHaveBeenCalled();
});
