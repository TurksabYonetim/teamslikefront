import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "@/i18n/i18n";
import { ToastProvider } from "@/components/ui/Toast";
import { authStore } from "@/lib/authStore";
import { IntelligenceDashboard } from "./IntelligenceDashboard";
import { intelStore } from "./intel.store";
import { SOURCES } from "./intel.data";

beforeEach(() => {
  intelStore.getState().resetStore();
  localStorage.clear();
  authStore.getState().setRole("admin");
  void i18n.changeLanguage("en");
});
const renderDash = (initial = "/intelligence", withToast = false) =>
  render(
    <MemoryRouter initialEntries={[initial]}>
      {withToast ? (
        <ToastProvider>
          <IntelligenceDashboard />
        </ToastProvider>
      ) : (
        <IntelligenceDashboard />
      )}
    </MemoryRouter>,
  );

describe("IntelligenceDashboard", () => {
  it("renders header, KPIs and tabs", () => {
    renderDash();
    expect(screen.getByTestId("intel-dashboard")).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(SOURCES[0].title, "i")),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /overview|genel/i })).toBeInTheDocument();
  });
  it("live toggle flips store", () => {
    renderDash();
    fireEvent.click(screen.getByRole("button", { name: /live|canlı|goLive|liveOn/i }));
    expect(intelStore.getState().live).toBe(true);
  });
  it("transcript tab exposes the translate-to select that updates store", () => {
    renderDash();
    fireEvent.click(screen.getByRole("tab", { name: /transcript|transkript|çeviri/i }));
    // Özel Select (native değil): tetikleyiciyi aç, ardından "Türkçe" seçeneğini tıkla.
    fireEvent.click(screen.getByRole("combobox", { name: /translateTo|çeviri|translate/i }));
    fireEvent.click(screen.getByRole("option", { name: /Türkçe/i }));
    expect(intelStore.getState().targetLang).toBe("tr");
  });
  it("deep-link ?source= sets active source", () => {
    const second = SOURCES[1].id;
    renderDash(`/intelligence?source=${second}`);
    expect(intelStore.getState().activeSourceId).toBe(second);
  });
  it("shows the onboarding tour on first visit (localStorage empty) and not after seen", () => {
    renderDash();
    // tur açık → hoş geldin başlığı görünür
    expect(screen.getByText(/welcome|hoş geldin|Konuşma Zekâsı'na/i)).toBeInTheDocument();
    // atla → kapanır + localStorage işaretlenir
    fireEvent.click(screen.getByRole("button", { name: /skip|atla/i }));
    expect(localStorage.getItem("tl_onboarded_intelligence")).toBe("1");
  });
  it("help button reopens the tour", () => {
    localStorage.setItem("tl_onboarded_intelligence", "1");
    renderDash();
    // görülmüş → tur kapalı
    expect(screen.queryByText(/welcome|hoş geldin/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /tour|tur|nasıl|help|\?/i }));
    expect(screen.getByText(/welcome|hoş geldin|Konuşma Zekâsı'na/i)).toBeInTheDocument();
  });

  it("source options include the kind label", () => {
    renderDash();
    const sel = screen.getByLabelText(/source|kaynak/i);
    // "Daily Standup · Meeting"
    expect(sel).toHaveTextContent(new RegExp(SOURCES[0].title, "i"));
    expect(sel).toHaveTextContent(/Meeting/i);
  });

  it("AI Summarize fires a configured copilot toast", () => {
    renderDash("/intelligence", true);
    fireEvent.click(screen.getByRole("button", { name: /summarize|özetle/i }));
    expect(screen.getByText(/AI summary/i)).toBeInTheDocument();
  });

  it("AI Action items fires a configured copilot toast", () => {
    renderDash("/intelligence", true);
    fireEvent.click(
      screen.getByRole("button", { name: /action items|aksiyon maddeleri/i }),
    );
    // Toast headline is count-prefixed ("2 action items · …"), distinct from the button.
    expect(screen.getByText(/\d+ action items ·/i)).toBeInTheDocument();
  });
});
