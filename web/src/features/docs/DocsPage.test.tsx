import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import "@/i18n/i18n";
import { DocsPage } from "./DocsPage";
import { CanvasEditor } from "./components/CanvasEditor";
import { AppsPanel } from "./components/AppsPanel";
import { workspaceStore } from "./workspace.store";
import { workhubStore } from "./workhub.store";

const renderPage = (initial = "/docs") =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initial]}>
        <DocsPage />
      </MemoryRouter>
    </ToastProvider>,
  );

beforeEach(() => {
  workspaceStore.getState().reset();
  workhubStore.getState().reset();
});

describe("DocsPage", () => {
  it("renders six tabs with the canvas selected by default", () => {
    renderPage();
    const tablist = screen.getByRole("tablist");
    expect(within(tablist).getAllByRole("tab")).toHaveLength(6);
    expect(screen.getByRole("tab", { name: /canvas/i })).toHaveAttribute("aria-selected", "true");
  });

  it("honours the ?tab= deep link", () => {
    renderPage("/docs?tab=clips");
    expect(screen.getByRole("tab", { name: /clips|klip/i })).toHaveAttribute("aria-selected", "true");
  });

  it("switches tabs on click", () => {
    renderPage();
    fireEvent.click(screen.getByRole("tab", { name: /board|pano/i }));
    expect(screen.getByRole("tab", { name: /board|pano/i })).toHaveAttribute("aria-selected", "true");
  });
});

describe("CanvasEditor", () => {
  it("adds a block through the composer", () => {
    render(<CanvasEditor />);
    const docId = workspaceStore.getState().activeDocId;
    const before = workspaceStore.getState().docs.find((d) => d.id === docId)!.blocks.length;
    const input = screen.getByLabelText(/type some text|bir şeyler/i);
    fireEvent.change(input, { target: { value: "fresh block" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(workspaceStore.getState().docs.find((d) => d.id === docId)!.blocks.length).toBe(before + 1);
  });
});

describe("AppsPanel", () => {
  it("approves a pending request", () => {
    render(<AppsPanel />);
    const approveBtn = screen.getAllByRole("button", { name: /approve|onayla/i })[0];
    fireEvent.click(approveBtn);
    expect(workhubStore.getState().approvals.some((a) => a.status === "approved")).toBe(true);
  });
});
