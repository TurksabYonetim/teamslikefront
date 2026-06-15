// web/src/features/webinar/QnaBoard.test.tsx
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QnaBoard } from "./components/QnaBoard";
import { qnaStore } from "./qna.store";
import { authStore } from "@/lib/authStore";
import "@/i18n/i18n";

beforeEach(() => qnaStore.getState().reset());
afterEach(() => authStore.getState().setRole("admin"));

describe("QnaBoard moderation auth", () => {
  it("shows mark-answered for admins (admin.access)", () => {
    authStore.getState().setRole("admin");
    render(<QnaBoard />);
    // Seed QNA'da yanıtlanmamış sorular var → en az bir 'Yanıtlandı işaretle'.
    expect(screen.getAllByText("Yanıtlandı işaretle").length).toBeGreaterThan(0);
  });

  it("hides mark-answered for members (no admin.access)", () => {
    authStore.getState().setRole("member");
    render(<QnaBoard />);
    expect(screen.queryByText("Yanıtlandı işaretle")).toBeNull();
  });
});
