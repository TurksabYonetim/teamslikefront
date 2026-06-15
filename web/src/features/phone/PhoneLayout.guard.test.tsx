import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import i18n from "@/i18n/i18n";

// useCan'i izinsiz (false) döndürerek Forbidden yolunu doğrula.
const canMock = vi.fn();
vi.mock("@/lib/authStore", () => ({
  useCan: (...args: unknown[]) => canMock(...args),
}));

import { PhoneLayout } from "./PhoneLayout";

beforeEach(() => {
  void i18n.changeLanguage("tr");
  canMock.mockReset();
});

function renderLayout() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/phone"]}>
          <PhoneLayout />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("PhoneLayout — izin koruması", () => {
  it("telephony.view yoksa Forbidden gösterir, sekmeleri gizler", () => {
    canMock.mockReturnValue(false);
    renderLayout();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(canMock).toHaveBeenCalledWith("telephony.view");
  });

  it("telephony.view varsa modülü render eder", () => {
    canMock.mockReturnValue(true);
    renderLayout();
    expect(screen.getByRole("tablist", { name: /telefon|phone/i })).toBeInTheDocument();
  });
});
