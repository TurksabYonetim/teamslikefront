import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { MessagesPane } from "./MessagesPane";
import { smsStore } from "./smsStore";

function renderPane() {
  return render(<MessagesPane />);
}

beforeEach(async () => {
  await i18n.changeLanguage("en");
  smsStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("MessagesPane", () => {
  it("thread listesini gösterir", () => {
    renderPane();
    expect(screen.getByText("Jordan Blake")).toBeInTheDocument();
    expect(screen.getByText("Acme Procurement")).toBeInTheDocument();
  });

  it("bir thread seçince mesajları gösterir ve okundu işaretler", () => {
    renderPane();
    act(() => screen.getByText("Jordan Blake").click());
    expect(screen.getByText("Are we still on for 3pm?")).toBeInTheDocument();
    expect(smsStore.getState().threads.find((t) => t.id === "sms_1")?.unread).toBe(0);
  });

  it("mesaj gönderince thread'e outbound mesaj ekler", () => {
    renderPane();
    act(() => screen.getByText("Jordan Blake").click());
    const input = screen.getByPlaceholderText("Type a message…");
    fireEvent.change(input, { target: { value: "Test mesajı" } });
    act(() => screen.getByRole("button", { name: "Send" }).click());
    expect(screen.getAllByText("Test mesajı").length).toBeGreaterThan(0);
    const thread = smsStore.getState().threads.find((t) => t.id === "sms_1")!;
    expect(thread.messages.slice(-1)[0].body).toBe("Test mesajı");
    expect(thread.messages.slice(-1)[0].outbound).toBe(true);
  });

  it("zamanlı gönderim kuyruğa ekler", () => {
    renderPane();
    act(() => screen.getByText("Jordan Blake").click());
    const input = screen.getByPlaceholderText("Type a message…");
    fireEvent.change(input, { target: { value: "Sonra gönder" } });
    act(() => screen.getByRole("button", { name: "Schedule" }).click());
    const at = screen.getByLabelText("Send at");
    fireEvent.change(at, { target: { value: "2099-01-01T10:00" } });
    const scheduleBtns = screen.getAllByRole("button", { name: "Schedule" });
    act(() => scheduleBtns[scheduleBtns.length - 1].click());
    expect(smsStore.getState().scheduled.length).toBe(1);
    expect(smsStore.getState().scheduled[0].body).toBe("Sonra gönder");
  });
});
