import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RecapPanel } from "./RecapPanel";
import { intelStore } from "../intel.store";
beforeEach(() => intelStore.getState().resetStore());
describe("RecapPanel", () => {
  it("renders without crashing", () => {
    expect(render(<MemoryRouter><RecapPanel /></MemoryRouter>).container).toBeTruthy();
  });
});
