import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ControlBar } from "./ControlBar";
import { meetingStore } from "../meetings.store";
import { MEETING_REACTIONS } from "../meetings.store.types";
import { intelStore } from "@/features/intelligence/intel.store";
import { SOURCES } from "@/features/intelligence/intel.data";

beforeEach(() => {
  meetingStore.getState().resetStore();
  intelStore.getState().resetStore();
});

describe("ControlBar", () => {
  it("mic button toggles store.micOn", () => {
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    const before = meetingStore.getState().micOn;
    fireEvent.click(screen.getByRole("button", { name: /mute|unmute|mikrofon|sustur/i }));
    expect(meetingStore.getState().micOn).toBe(!before);
  });
  it("participants button sets side panel", () => {
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /participants|katılımcı/i }));
    expect(meetingStore.getState().sidePanel).toBe("participants");
  });
  it("leave button calls leave (phase idle)", () => {
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /leave|ayrıl/i }));
    expect(meetingStore.getState().phase).toBe("idle");
  });
  it("analyze button opens intelligence (sets source)", () => {
    intelStore.getState().setSource(SOURCES[1].id);
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    const btn = screen.getByRole("button", {
      name: /^analyze$|analiz|intelligence|zek/i,
    });
    fireEvent.click(btn);
    expect(intelStore.getState().activeSourceId).toBe("src_standup");
  });

  it("AI notes button runs the copilot without touching intelligence", () => {
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    const before = intelStore.getState().activeSourceId;
    fireEvent.click(screen.getByRole("button", { name: /^aiNotes$|ai not|ai notes/i }));
    // Copilot is a stub: it must NOT navigate or change the intelligence source.
    expect(intelStore.getState().activeSourceId).toBe(before);
  });

  it("tepki emojisine tıklamak tek tıkla sendReaction çağırır", () => {
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    const before = meetingStore.getState().reactions.length;
    fireEvent.click(screen.getByLabelText("👍"));
    const after = meetingStore.getState().reactions;
    expect(after.length).toBe(before + 1);
    expect(after.some((r) => r.emoji === "👍")).toBe(true);
  });

  it("tüm tepki emojileri inline render edilir", () => {
    render(
      <MemoryRouter>
        <ControlBar />
      </MemoryRouter>,
    );
    for (const e of MEETING_REACTIONS) {
      expect(screen.getByLabelText(e)).toBeInTheDocument();
    }
  });
});
