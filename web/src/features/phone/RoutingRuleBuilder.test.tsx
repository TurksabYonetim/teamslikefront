import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { RoutingRuleBuilder } from "./RoutingRuleBuilder";
import { pbxStore } from "./pbxStore";

beforeEach(async () => {
  await i18n.changeLanguage("en");
  pbxStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("RoutingRuleBuilder", () => {
  it("kuralları ve canlı önizlemeyi gösterir", () => {
    render(<RoutingRuleBuilder />);
    expect(screen.getByText("Live preview")).toBeInTheDocument();
    expect(screen.getByText(/Winning rule/)).toBeInTheDocument();
  });

  it("afterHours toggle önizlemeyi günceller", () => {
    render(<RoutingRuleBuilder />);
    fireEvent.click(screen.getByLabelText("afterHours"));
    expect(screen.getAllByText(/Voicemail/)[0]).toBeInTheDocument();
  });

  it("bir kuralı kaldırır", () => {
    render(<RoutingRuleBuilder />);
    const before = pbxStore.getState().routingRules.length;
    act(() => screen.getAllByRole("button", { name: /Remove/ })[0].click());
    expect(pbxStore.getState().routingRules.length).toBe(before - 1);
  });
});
