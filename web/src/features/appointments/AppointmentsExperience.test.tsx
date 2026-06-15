// web/src/features/appointments/AppointmentsExperience.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { AppointmentsPage } from "./AppointmentsPage";
import { appointmentsStore } from "./appointments.store";
import { workspaceStore } from "./workspace.store";
import { authStore } from "@/lib/authStore";
import { tenantStore } from "@/lib/tenantStore";
import "@/i18n/i18n";

// scheduling.view'i test başına aç/kapat — hiçbir demo rolü onu reddetmediğinden
// guard'ı doğrulamanın tek yolu izin kontrolünü mock'lamaktır.
const mockState = { canView: true };
vi.mock("@/lib/authStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/authStore")>();
  return { ...actual, useCan: () => mockState.canView };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/appointments"]}>
      <ToastProvider>
        <AppointmentsPage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  appointmentsStore.getState().reset();
  workspaceStore.getState().reset();
  authStore.getState().setRole("admin");
  tenantStore.getState().setWorkspace(null);
  mockState.canView = true;
});
afterEach(() => {
  tenantStore.getState().setWorkspace(null);
  mockState.canView = true;
});

describe("AppointmentsPage", () => {
  it("renders 3 top-level surfaces + 3 console tabs by default", () => {
    renderPage();
    // 3 yüzey (Konsol/Genel/Çalışma alanı) + 3 konsol alt sekmesi = 6 tab rolü.
    expect(screen.getAllByRole("tab").length).toBe(6);
    expect(screen.getAllByText("Tanışma görüşmesi").length).toBeGreaterThan(0);
  });

  it("switches to availability tab without crashing", () => {
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /Müsaitlik|Availability/ }));
    expect(screen.getAllByText(/Pzt|Mon/).length).toBeGreaterThan(0);
  });

  it("public surface shows booking preview", () => {
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /Genel sayfa|Public page/ }));
    expect(screen.getAllByText(/Önizleme|Preview/).length).toBeGreaterThan(0);
  });

  it("workspace surface lists desks", () => {
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /Çalışma alanı|Workspace/ }));
    expect(screen.getAllByText(/Masa A1|Desk A1/).length).toBeGreaterThan(0);
  });

  it("renders Forbidden when scheduling.view denied", () => {
    mockState.canView = false;
    renderPage();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryAllByRole("tab").length).toBe(0);
  });

  it("workspace filter narrows event type list", () => {
    tenantStore.getState().setWorkspace("ws_growth");
    renderPage();
    const list = screen.getByRole("list");
    // ws_growth yalnız "Büyüme senkronu" türünü içerir; diğerleri süzülür.
    expect(within(list).getByText("Büyüme senkronu")).toBeInTheDocument();
    expect(within(list).queryByText("Strateji oturumu")).not.toBeInTheDocument();
  });
});
