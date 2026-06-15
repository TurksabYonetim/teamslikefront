import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { authStore } from "@/lib/authStore";
import { CoachingPanel } from "./CoachingPanel";
import { intelStore } from "../intel.store";

beforeEach(() => {
  intelStore.getState().resetStore();
  authStore.getState().setRole("admin");
  void i18n.changeLanguage("en");
});
afterEach(() => authStore.getState().setRole("admin"));

describe("CoachingPanel", () => {
  it("renders without crashing", () => {
    expect(render(<CoachingPanel />).container).toBeTruthy();
  });

  it("manager (admin.access) sees coaching cues", () => {
    authStore.getState().setRole("admin");
    intelStore.getState().setSource("src_sales"); // has seeded cues
    render(<CoachingPanel />);
    expect(
      screen.getByText(/acknowledge before countering/i),
    ).toBeInTheDocument();
  });

  it("non-manager (member) sees a locked notice, not the tips", () => {
    authStore.getState().setRole("member");
    intelStore.getState().setSource("src_sales");
    render(<CoachingPanel />);
    expect(screen.getByRole("note")).toBeInTheDocument();
    expect(
      screen.queryByText(/acknowledge before countering/i),
    ).not.toBeInTheDocument();
  });
});
