import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { ReceptionistBuilder } from "./ReceptionistBuilder";
import { receptionistStore } from "./receptionistStore";

beforeEach(async () => {
  await i18n.changeLanguage("en");
  receptionistStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("ReceptionistBuilder", () => {
  it("seed intent'lerini gösterir", () => {
    render(<ReceptionistBuilder />);
    expect(screen.getByText("Satış")).toBeInTheDocument();
    expect(screen.getByText("Destek")).toBeInTheDocument();
  });

  it("canlı simülasyonda intent algılar", () => {
    render(<ReceptionistBuilder />);
    const input = screen.getByPlaceholderText("Type a phrase…");
    fireEvent.change(input, { target: { value: "fiyat" } });
    act(() => screen.getByRole("button", { name: "Send" }).click());
    expect(receptionistStore.getState().session.turns.length).toBe(2);
    expect(screen.getByText(/Connecting you to the right team/)).toBeInTheDocument();
  });

  it("bir intent'i kaldırır", () => {
    render(<ReceptionistBuilder />);
    const before = receptionistStore.getState().config.intents.length;
    act(() => screen.getAllByRole("button", { name: /Remove/ })[0].click());
    expect(receptionistStore.getState().config.intents.length).toBe(before - 1);
  });
});
