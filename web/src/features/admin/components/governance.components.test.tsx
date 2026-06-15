import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { ToastProvider } from "@/components/ui";
import { adminStore } from "../governance.store";
import { SecurityPolicies } from "./SecurityPolicies";
import { BillingPanel } from "./BillingPanel";
import { FederationSettings } from "./FederationSettings";
import { PolicyTester } from "./PolicyTester";
import { GovOverviewDashboard } from "./GovOverviewDashboard";

beforeEach(() => {
  localStorage.clear();
  adminStore.getState().reset();
  void i18n.changeLanguage("en");
});

const wrap = (ui: React.ReactElement) => render(<ToastProvider>{ui}</ToastProvider>);

describe("GovOverviewDashboard", () => {
  it("renders plan badge and quota cards", () => {
    wrap(<GovOverviewDashboard />);
    expect(screen.getByText("Business")).toBeInTheDocument();
    // ai_actions quota is at 100% → "Exceeded"
    expect(screen.getByText("Exceeded")).toBeInTheDocument();
  });
});

describe("SecurityPolicies + ConfirmAction", () => {
  it("toggles a policy only after type-to-verify", () => {
    wrap(<SecurityPolicies />);
    const dlp = adminStore.getState().policies.find((p) => p.kind === "dlp")!;
    expect(dlp.enabled).toBe(true);

    // The DLP row's action button (enabled → "Disable")
    const row = screen.getByText("Data loss prevention (DLP)").closest("li")!;
    fireEvent.click(within(row).getByRole("button", { name: "Disable" }));

    // Confirm is disabled until exact verify word typed
    const confirmBtn = within(row).getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeDisabled();

    const input = within(row).getByLabelText(/Type "DLP"/);
    fireEvent.change(input, { target: { value: "DLP" } });
    expect(within(row).getByRole("button", { name: "Confirm" })).toBeEnabled();
    fireEvent.click(within(row).getByRole("button", { name: "Confirm" }));

    expect(adminStore.getState().policies.find((p) => p.kind === "dlp")!.enabled).toBe(false);
  });

  it("edits a policy config field", () => {
    wrap(<SecurityPolicies />);
    const input = screen.getByLabelText("Retention · days");
    fireEvent.change(input, { target: { value: "180" } });
    expect(
      adminStore.getState().policies.find((p) => p.kind === "retention")!.config.days,
    ).toBe("180");
  });
});

describe("PolicyTester", () => {
  it("surfaces DLP findings from default sample text", () => {
    wrap(<PolicyTester />);
    // default text has a card number + "leak"
    expect(screen.getByText(/DLP findings: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Flagged terms: 1/)).toBeInTheDocument();
    expect(screen.getByText("Communication blocked")).toBeInTheDocument();
  });
});

describe("FederationSettings", () => {
  it("adds a bridge", () => {
    wrap(<FederationSettings />);
    const input = screen.getByLabelText(/Bridge name/);
    fireEvent.change(input, { target: { value: "discord" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(adminStore.getState().federation[0].bridges).toContain("discord");
  });
});

describe("BillingPanel", () => {
  it("upgrades plan after confirmation", () => {
    wrap(<BillingPanel />);
    // default target is enterprise
    fireEvent.click(screen.getByRole("button", { name: "Upgrade plan" }));
    const input = screen.getByLabelText(/Type "ENTERPRISE"/);
    fireEvent.change(input, { target: { value: "ENTERPRISE" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(adminStore.getState().billing.plan).toBe("enterprise");
  });
});
