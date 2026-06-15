// web/src/components/ui/ProductTour.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductTour, type TourStep } from "./ProductTour";

const steps: TourStep[] = [
  { title: "Adım 1", body: "Birinci" },
  { targetId: "tgt", title: "Adım 2", body: "İkinci" },
  { title: "Adım 3", body: "Üçüncü" },
];

beforeEach(() => {
  document.body.innerHTML = "";
  const el = document.createElement("div");
  el.id = "tgt";
  document.body.appendChild(el);
});

describe("ProductTour", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<ProductTour open={false} steps={steps} onFinish={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
  it("walks steps forward and finishes on last Next", () => {
    const onFinish = vi.fn();
    render(<ProductTour open steps={steps} onFinish={onFinish} />);
    expect(screen.getByText("Adım 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next|ileri/i }));
    expect(screen.getByText("Adım 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next|ileri/i }));
    expect(screen.getByText("Adım 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /finish|bitir/i }));
    expect(onFinish).toHaveBeenCalledOnce();
  });
  it("skip calls onFinish", () => {
    const onFinish = vi.fn();
    render(<ProductTour open steps={steps} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole("button", { name: /skip|atla/i }));
    expect(onFinish).toHaveBeenCalledOnce();
  });
  it("calls onStep with tab when entering a step", () => {
    const onStep = vi.fn();
    const tabbed: TourStep[] = [{ title: "a", body: "a", tab: "overview" }, { title: "b", body: "b", tab: "transcript" }];
    render(<ProductTour open steps={tabbed} onFinish={() => {}} onStep={onStep} />);
    expect(onStep).toHaveBeenCalledWith(tabbed[0], 0);
    fireEvent.click(screen.getByRole("button", { name: /next|ileri/i }));
    expect(onStep).toHaveBeenCalledWith(tabbed[1], 1);
  });
});
