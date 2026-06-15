import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { ChannelHeader } from "./ChannelHeader";
import { messagingStore } from "../store";

beforeEach(() => messagingStore.getState().resetStore());
const renderHeader = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ChannelHeader />
      </ToastProvider>
    </MemoryRouter>,
  );

describe("ChannelHeader", () => {
  it("shows the active channel name", () => {
    renderHeader();
    expect(screen.getByText("product")).toBeInTheDocument();
  });
  it("details toggle flips store flag", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /detay|details/i }));
    expect(messagingStore.getState().detailsOpen).toBe(true);
  });

  it("renders an AI Catch Up button on a channel", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /catch|özetle/i })).toBeInTheDocument();
  });

  it("shows the ongoing meeting bar with a join action when channel has a meeting", () => {
    // seed ch_product has ongoingMeetingId
    renderHeader();
    expect(screen.getByTestId("ongoing-meeting-bar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join|katıl/i })).toBeInTheDocument();
  });

  it("shows the Intelligence button only on customer channels", () => {
    renderHeader();
    // ch_product is not a customer channel → no intelligence button
    expect(screen.queryByRole("button", { name: /intelligence|zek/i })).not.toBeInTheDocument();
    messagingStore.getState().setChannel("dm_jordan"); // isCustomer
    renderHeader();
    expect(screen.getAllByRole("button", { name: /intelligence|zek/i }).length).toBeGreaterThan(0);
  });
});
