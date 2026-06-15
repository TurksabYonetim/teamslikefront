import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SpeakerAnalytics } from "./SpeakerAnalytics";
import { intelStore } from "../intel.store";
beforeEach(() => intelStore.getState().resetStore());
describe("SpeakerAnalytics", () => {
  it("renders without crashing", () => { expect(render(<SpeakerAnalytics />).container).toBeTruthy(); });
});
