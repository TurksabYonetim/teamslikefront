import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge tone="accent">5</Badge>);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
  it("applies a tone class", () => {
    render(<Badge tone="positive">ok</Badge>);
    expect(screen.getByText("ok").className).toMatch(/green/);
  });
});
