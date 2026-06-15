import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PresenceDot } from "./PresenceDot";

describe("PresenceDot", () => {
  it("renders a colored dot per presence", () => {
    const { container, rerender } = render(<PresenceDot presence="online" />);
    expect(container.firstChild).toHaveClass("bg-green-500");
    rerender(<PresenceDot presence="offline" />);
    expect(container.firstChild).toHaveClass("bg-gray-400");
  });
});
