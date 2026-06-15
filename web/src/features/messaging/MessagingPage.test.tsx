// web/src/features/messaging/MessagingPage.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { tenantStore } from "@/lib/tenantStore";
import { MessagingPage } from "./MessagingPage";
import { messagingStore } from "./store";

// MailInbox react-query/ağır bağımlılıklar içerebilir; kabuk testinde mock'la.
vi.mock("./MailInbox", () => ({ MailInbox: () => <div data-testid="mail-inbox" /> }));

beforeEach(() => {
  messagingStore.getState().resetStore();
  tenantStore.getState().setWorkspace(null);
});

const renderPage = (section: "channels" | "dm" | "inbox", entries: string[] = ["/"]) =>
  render(
    <MemoryRouter initialEntries={entries}>
      <ToastProvider>
        <MessagingPage section={section} />
      </ToastProvider>
    </MemoryRouter>,
  );

describe("MessagingPage shell", () => {
  it("shows the active channel name for channels section", () => {
    renderPage("channels");
    // seed ilk kanal: product (sidebar + header'da geçer → getAllByText)
    expect(screen.getAllByText(/product/i).length).toBeGreaterThan(0);
  });

  it("sets initial folder to dms for dm section", () => {
    renderPage("dm");
    expect(messagingStore.getState().folder).toBe("dms");
  });

  it("renders the mail inbox for inbox section", () => {
    renderPage("inbox");
    expect(screen.getByTestId("mail-inbox")).toBeInTheDocument();
    expect(screen.queryByTestId("messaging-shell")).not.toBeInTheDocument();
  });

  it("applies the ?c= deep-link to the active channel on load", () => {
    renderPage("channels", ["/messages?c=ch_eng"]);
    expect(messagingStore.getState().activeChannelId).toBe("ch_eng");
  });

  it("auto-selects the first channel of a workspace when it changes", () => {
    renderPage("channels");
    expect(messagingStore.getState().activeChannelId).toBe("ch_product"); // ws_core
    act(() => {
      tenantStore.getState().setWorkspace("ws_growth");
    });
    // ch_announce (broadcast, ws_growth) is the first non-dm channel in ws_growth
    expect(messagingStore.getState().channels.find((c) => c.id === messagingStore.getState().activeChannelId)?.workspaceId).toBe("ws_growth");
  });
});
