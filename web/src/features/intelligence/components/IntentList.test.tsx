import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { IntentList } from "./IntentList";
import { intelStore } from "../intel.store";

beforeEach(() => intelStore.getState().resetStore());

describe("IntentList", () => {
  it("renders without crashing", () => {
    expect(render(<IntentList />).container).toBeTruthy();
  });
});
