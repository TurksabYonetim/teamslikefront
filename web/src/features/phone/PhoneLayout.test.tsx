import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import i18n from "@/i18n/i18n";
import en from "@/i18n/locales/en/phone.json";
import { PhoneLayout } from "./PhoneLayout";

beforeEach(() => {
  void i18n.changeLanguage("tr");
});

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderAt(path = "/phone") {
  return render(
    <QueryClientProvider client={makeClient()}>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <PhoneLayout />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("PhoneLayout", () => {
  it("renders all 10 tabs", () => {
    renderAt();
    // Scope to the phone nav tablist (has aria-label="Telefon") to avoid counting
    // CallHistory's inner filter tabs.
    const navTablist = screen.getByRole("tablist", { name: /telefon|phone/i });
    expect(within(navTablist).getAllByRole("tab")).toHaveLength(10);
  });

  it("defaults to the keypad tab", () => {
    renderAt();
    const keypad = screen.getByRole("tab", { name: /tuş takımı|keypad/i });
    expect(keypad).toHaveAttribute("aria-selected", "true");
  });

  it("honours the ?tab= deep-link", () => {
    renderAt("/phone?tab=analytics");
    const analytics = screen.getByRole("tab", { name: /analitik|analytics/i });
    expect(analytics).toHaveAttribute("aria-selected", "true");
  });

  it("switches the selected tab on click", () => {
    renderAt();
    const voicemail = screen.getByRole("tab", { name: /sesli mesaj|voicemail/i });
    fireEvent.click(voicemail);
    expect(voicemail).toHaveAttribute("aria-selected", "true");
  });

  it("falls back to the keypad tab for an invalid ?tab= value", () => {
    renderAt("/phone?tab=garbage");
    const keypad = screen.getByRole("tab", { name: /tuş takımı|keypad/i });
    expect(keypad).toHaveAttribute("aria-selected", "true");
  });

  it("deselects the previously active tab when switching", () => {
    renderAt();
    const keypad = screen.getByRole("tab", { name: /tuş takımı|keypad/i });
    const voicemail = screen.getByRole("tab", { name: /sesli mesaj|voicemail/i });
    fireEvent.click(voicemail);
    expect(keypad).toHaveAttribute("aria-selected", "false");
    expect(voicemail).toHaveAttribute("aria-selected", "true");
  });

  it("moves selection to the next tab on ArrowRight", () => {
    renderAt();
    const keypad = screen.getByRole("tab", { name: /tuş takımı|keypad/i });
    const directory = screen.getByRole("tab", { name: /rehber|directory/i });
    keypad.focus();
    fireEvent.keyDown(keypad, { key: "ArrowRight" });
    expect(directory).toHaveAttribute("aria-selected", "true");
  });

  it("keypad sekmesi placeholder yerine gerçek tuş takımını render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt();
    expect(screen.queryByText(en.comingSoon)).not.toBeInTheDocument();
  });

  it("reception sekmesi AI resepsiyonu render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=reception");
    expect(screen.getByRole("heading", { name: en.reception.title })).toBeInTheDocument();
  });

  it("analytics sekmesi çağrı analitiğini render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=analytics");
    // With retry:false the network call fails quickly → isError=true → EmptyState("No call data")
    expect(await screen.findByText(en.analytics.empty)).toBeInTheDocument();
  });

  it("voicemail sekmesi sesli mesaj kutusunu render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=voicemail");
    expect(screen.getByRole("heading", { name: en.voicemail.title })).toBeInTheDocument();
  });

  it("messages sekmesi mesajlar panelini render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=messages");
    expect(screen.getByText(en.messages.threads)).toBeInTheDocument();
  });

  it("queues sekmesi çağrı kuyrukları panelini render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=queues");
    expect(screen.getByRole("heading", { name: en.queues.title })).toBeInTheDocument();
  });

  it("attendant sekmesi operatör konsolunu render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=attendant");
    expect(screen.getByRole("heading", { name: en.attendant.title })).toBeInTheDocument();
  });

  it("ivr sekmesi IVR düzenleyiciyi render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=ivr");
    expect(screen.getByRole("heading", { name: en.ivr.title })).toBeInTheDocument();
  });

  it("routing sekmesi yönlendirme düzenleyiciyi render eder", async () => {
    await i18n.changeLanguage("en");
    renderAt("/phone?tab=routing");
    expect(screen.getByRole("heading", { name: en.routing.title })).toBeInTheDocument();
  });
});
