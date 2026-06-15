import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): JSX.Element {
  throw new Error("patladı");
}

describe("ErrorBoundary", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("hata olmadığında çocukları render eder", () => {
    render(
      <ErrorBoundary>
        <div>içerik</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("içerik")).toBeInTheDocument();
  });

  it("hata yakalandığında fallback gösterir", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/bir şeyler ters gitti/i)).toBeInTheDocument();
  });
});
