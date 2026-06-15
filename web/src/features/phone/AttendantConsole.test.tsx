import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { AttendantConsole } from "./AttendantConsole";
import { pbxStore } from "./pbxStore";
import { callStore } from "./callStore";

beforeEach(async () => {
  await i18n.changeLanguage("en");
  pbxStore.getState().resetStore();
  callStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("AttendantConsole", () => {
  it("tüm kuyruklardaki bekleyen çağrıları listeler", () => {
    render(<AttendantConsole />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it("bir çağrıyı dahiliye aktarınca bekleyenlerden kaldırır", () => {
    render(<AttendantConsole />);
    const before = pbxStore.getState().queues[0].waiting.length;
    act(() => screen.getAllByRole("button", { name: /Transfer/ })[0].click());
    expect(pbxStore.getState().queues[0].waiting.length).toBe(before - 1);
  });

  it("süpervizör izleme modu seçilince callStore.monitor ayarlanır + matris gösterilir", () => {
    render(<AttendantConsole />);
    act(() => screen.getByRole("button", { name: "Whisper" }).click());
    expect(callStore.getState().monitor).toBe("whisper");
    expect(screen.getByText(/Agent hears supervisor/)).toBeInTheDocument();
  });
});
