import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("test altyapısı", () => {
  it("render eder", () => {
    render(<div>merhaba</div>);
    expect(screen.getByText("merhaba")).toBeInTheDocument();
  });
});
