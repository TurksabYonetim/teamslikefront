import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { WrapUpCard } from "./WrapUpCard";
import { callStore } from "./callStore";

beforeEach(async () => {
  await i18n.changeLanguage("en");
  callStore.getState().resetStore();
});
afterEach(() => cleanup());

describe("WrapUpCard", () => {
  it("pendingDisposition yokken render etmez", () => {
    const { container } = render(<WrapUpCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("dispozisyon kaydeder", () => {
    act(() => {
      callStore.getState().place("+14155559999", "Ada");
      callStore.getState().answer();
      callStore.getState().hangup();
    });
    render(<WrapUpCard />);
    const note = screen.getByLabelText("Note");
    fireEvent.change(note, { target: { value: "Çözüldü notu" } });
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(callStore.getState().dispositions).toHaveLength(1);
    expect(callStore.getState().pendingDisposition).toBeNull();
  });

  it("vazgeçince kaydetmeden kapanır", () => {
    act(() => {
      callStore.getState().place("+1");
      callStore.getState().answer();
      callStore.getState().hangup();
    });
    render(<WrapUpCard />);
    act(() => screen.getByRole("button", { name: "Dismiss" }).click());
    expect(callStore.getState().pendingDisposition).toBeNull();
    expect(callStore.getState().dispositions).toHaveLength(0);
  });
});
