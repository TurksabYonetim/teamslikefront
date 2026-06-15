import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TrackersCard } from "./TrackersCard";
import { intelStore } from "../intel.store";

beforeEach(() => intelStore.getState().resetStore());

describe("TrackersCard", () => {
  it("renders without crashing", () => {
    expect(render(<TrackersCard />).container).toBeTruthy();
  });
});
