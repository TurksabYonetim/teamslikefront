import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MeetingNotesCard } from "./MeetingNotesCard";
import { intelStore } from "../intel.store";

beforeEach(() => intelStore.getState().resetStore());

describe("MeetingNotesCard", () => {
  it("renders without crashing", () => {
    expect(render(<MeetingNotesCard />).container).toBeTruthy();
  });
});
