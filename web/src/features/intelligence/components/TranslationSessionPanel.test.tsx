import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TranslationSessionPanel } from "./TranslationSessionPanel";
import { captionsStore } from "../captions.store";
beforeEach(() => captionsStore.getState().resetStore());
describe("TranslationSessionPanel", () => {
  it("starts a session", () => {
    render(<TranslationSessionPanel />);
    fireEvent.click(screen.getByRole("button", { name: /start|başlat/i }));
    expect(captionsStore.getState().session).not.toBeNull();
  });
});
