import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { IVRBuilder } from "./IVRBuilder";
import { pbxStore } from "./pbxStore";

beforeEach(async () => {
  await i18n.changeLanguage("en");
  pbxStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("IVRBuilder", () => {
  it("menü seçeneklerini ve mesai durumunu gösterir", () => {
    render(<IVRBuilder />);
    expect(screen.getByText("Satış")).toBeInTheDocument();
    expect(screen.getByText(/Open now|Closed now/)).toBeInTheDocument();
  });

  it("yeni seçenek ekler", () => {
    render(<IVRBuilder />);
    const before = pbxStore.getState().ivrMenus[0].options.length;
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "7" } });
    act(() => screen.getByRole("button", { name: "Add option" }).click());
    expect(pbxStore.getState().ivrMenus[0].options.length).toBe(before + 1);
  });

  it("bir seçeneği kaldırır", () => {
    render(<IVRBuilder />);
    const before = pbxStore.getState().ivrMenus[0].options.length;
    act(() => screen.getAllByRole("button", { name: /Remove/ })[0].click());
    expect(pbxStore.getState().ivrMenus[0].options.length).toBe(before - 1);
  });
});
