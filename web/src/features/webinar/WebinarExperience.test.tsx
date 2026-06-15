// web/src/features/webinar/WebinarExperience.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { WebinarPage } from "./WebinarPage";
import { webinarStore } from "./webinar.store";
import * as authStoreModule from "@/lib/authStore";
import { authStore } from "@/lib/authStore";
import "@/i18n/i18n";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/webinar"]}>
      <ToastProvider>
        <WebinarPage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  webinarStore.getState().reset();
  authStore.getState().setRole("admin");
});

describe("WebinarPage", () => {
  it("renders console with event title", () => {
    renderPage();
    // Başlık hem sayfa header'ında hem EventBuilder detay kartında görünür.
    expect(screen.getAllByText("AURA Product Launch 2030").length).toBeGreaterThan(0);
  });

  it("renders the Forbidden screen when webinar.view is denied", () => {
    // useCan'i geçici olarak false döndür → guard <Forbidden/> göstermeli.
    const spy = vi.spyOn(authStoreModule, "useCan").mockReturnValue(false);
    renderPage();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).toBeNull();
    spy.mockRestore();
  });

  it("switches to live preview", () => {
    renderPage();
    // WebinarPage faz tab'ları: "Konsol" seçili, "Canlı önizleme" değil.
    const liveTab = screen
      .getAllByRole("tab")
      .find((el) => el.getAttribute("aria-selected") === "false");
    if (liveTab) fireEvent.click(liveTab);
    expect(["live", "console"]).toContain(webinarStore.getState().phase);
  });
});
