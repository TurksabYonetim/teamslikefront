import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ChannelsPanel } from "./ChannelsPanel";
import { INBOXES } from "../support.data";

describe("ChannelsPanel", () => {
  it("bağlı kanalları seed durumlarıyla listeler", () => {
    render(<ChannelsPanel />);
    for (const ib of INBOXES) expect(screen.getByText(ib.name)).toBeInTheDocument();
    // Embedded Signup başlığı görünür
    expect(screen.getByText("channels.embeddedSignup")).toBeInTheDocument();
  });

  it("kuruluma devam butonu bağlantı durumunu ilerletir", () => {
    render(<ChannelsPanel />);
    // Telegram bot "pending" → advance → coexistence adımı (migrating)
    const tg = screen.getByText("Telegram bot").closest("li")!;
    const advance = within(tg).getByRole("button", { name: /channels\.advanceFor/ });
    fireEvent.click(advance);
    expect(within(tg).getByText("channels.step.migrating")).toBeInTheDocument();
  });

  it("sıfırla butonu seed durumuna döner", () => {
    render(<ChannelsPanel />);
    const tg = screen.getByText("Telegram bot").closest("li")!;
    fireEvent.click(within(tg).getByRole("button", { name: /channels\.advanceFor/ }));
    // reset görünür hale gelir
    const reset = within(tg).getByRole("button", { name: /channels\.resetFor/ });
    fireEvent.click(reset);
    expect(within(tg).getByText("channels.step.verifying")).toBeInTheDocument();
  });
});
