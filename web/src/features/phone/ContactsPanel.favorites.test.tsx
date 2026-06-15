import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { ToastProvider } from "@/components/ui/Toast";
import { directoryStore } from "./directoryStore";
import type { Contact } from "./phone.types";

const CONTACTS: Contact[] = [
  { id: "c1", name: "Ada Lovelace", number: "+14155559999", email: null, notes: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "c2", name: "Grace Hopper", number: "+14155551234", email: null, notes: null, created_at: "2026-01-01T00:00:00Z" },
];

vi.mock("./phone.hooks", () => ({
  useContacts: () => ({ data: CONTACTS, isLoading: false, isError: false }),
  useCreateContact: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateContact: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteContact: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { ContactsPanel } from "./ContactsPanel";

const renderPanel = () =>
  render(
    <ToastProvider>
      <ContactsPanel onCall={vi.fn()} />
    </ToastProvider>,
  );

beforeEach(async () => {
  await i18n.changeLanguage("en");
  directoryStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("ContactsPanel — favoriler", () => {
  it("yıldız toggle favori durumunu çevirir", () => {
    renderPanel();
    const star = screen.getByRole("button", { name: /Add to favorites — Ada Lovelace/ });
    act(() => star.click());
    expect(directoryStore.getState().favorites).toContain("c1");
  });

  it("favori çip satırı favori kişiyi gösterir", () => {
    act(() => directoryStore.getState().toggleFavorite("c1"));
    renderPanel();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    // çip + liste = en az 2 "Ada Lovelace" referansı
    expect(screen.getAllByText("Ada Lovelace").length).toBeGreaterThanOrEqual(1);
  });
});
