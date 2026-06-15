import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { RubricCard } from "./RubricCard";
import { intelStore } from "../intel.store";

beforeEach(() => intelStore.getState().resetStore());

describe("RubricCard", () => {
  it("renders without crashing", () => {
    const { container } = render(<RubricCard />);
    expect(container).toBeTruthy();
  });
});
