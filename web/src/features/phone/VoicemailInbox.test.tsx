import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import i18n from "@/i18n/i18n";
import { VoicemailInbox } from "./VoicemailInbox";
import { voicemailStore } from "./voicemailStore";

vi.mock("./phone.hooks", () => ({
  useContacts: () => ({ data: [] }),
}));

function renderInbox() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <VoicemailInbox />
    </QueryClientProvider>,
  );
}

beforeEach(async () => {
  await i18n.changeLanguage("en");
  voicemailStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("VoicemailInbox", () => {
  it("seed sesli mesajlarını listeler", () => {
    renderInbox();
    expect(screen.getByText(/please call me back about the proposal/i)).toBeInTheDocument();
  });

  it("okunmamış bir kaydı 'dinlendi' işaretler", () => {
    renderInbox();
    const buttons = screen.getAllByRole("button", { name: "Mark as heard" });
    expect(buttons.length).toBeGreaterThan(0);
    const unheardBefore = voicemailStore.getState().voicemails.filter((v) => !v.heard).length;
    fireEvent.click(buttons[0]);
    const unheardAfter = voicemailStore.getState().voicemails.filter((v) => !v.heard).length;
    expect(unheardAfter).toBe(unheardBefore - 1);
  });

  it("karşılama metnini kaydeder", () => {
    renderInbox();
    const textarea = screen.getByLabelText("Voicemail greeting");
    fireEvent.change(textarea, { target: { value: "Yeni karşılama metni" } });
    act(() => screen.getByRole("button", { name: "Save greeting" }).click());
    expect(voicemailStore.getState().greeting).toBe("Yeni karşılama metni");
  });
});
