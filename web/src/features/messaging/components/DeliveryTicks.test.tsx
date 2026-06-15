import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeliveryTicks } from "./DeliveryTicks";

describe("DeliveryTicks", () => {
  it("renders an accessible label per status", () => {
    const { rerender } = render(<DeliveryTicks status="sending" />);
    expect(screen.getByLabelText(/sending|gönder/i)).toBeInTheDocument();
    rerender(<DeliveryTicks status="read" />);
    expect(screen.getByLabelText(/read|okundu/i)).toBeInTheDocument();
  });
  it("returns nothing for undefined status", () => {
    const { container } = render(<DeliveryTicks status={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
