import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SupportPage } from "./SupportPage";

const renderAt = (path = "/support") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SupportPage />
    </MemoryRouter>,
  );

describe("SupportPage view switcher", () => {
  it("dört görünüm sekmesini gösterir, varsayılan Inbox seçili", () => {
    renderAt();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    const inbox = screen.getByRole("tab", { name: /views\.inbox/ });
    expect(inbox).toHaveAttribute("aria-selected", "true");
  });

  it("Automation sekmesine tıklayınca otomasyon görünümünü gösterir", () => {
    renderAt();
    fireEvent.click(screen.getByRole("tab", { name: /views\.automation/ }));
    expect(screen.getByRole("tab", { name: /views\.automation/ })).toHaveAttribute("aria-selected", "true");
    // ChannelsPanel başlığı görünür
    expect(screen.getByText("channels.title")).toBeInTheDocument();
  });

  it("?view= deep-link ile doğrudan Workforce açılır", () => {
    renderAt("/support?view=workforce");
    expect(screen.getByRole("tab", { name: /views\.workforce/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("wfo.forecast")).toBeInTheDocument();
  });

  it("ok tuşuyla sekmeler arasında gezinir", () => {
    renderAt();
    const inbox = screen.getByRole("tab", { name: /views\.inbox/ });
    fireEvent.keyDown(inbox, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /views\.automation/ })).toHaveAttribute("aria-selected", "true");
  });

  it("Studio sekmesi agent studio'yu gösterir", () => {
    renderAt("/support?view=studio");
    expect(screen.getByText("studio.agents")).toBeInTheDocument();
  });
});
