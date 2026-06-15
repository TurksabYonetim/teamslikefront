import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton, SkeletonText } from "./Skeleton";

describe("Skeleton", () => {
  it("verilen className'i uygular", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("animate-pulse");
  });

  it("SkeletonText istenen satır sayısını render eder", () => {
    const { container } = render(<SkeletonText lines={3} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });
});
