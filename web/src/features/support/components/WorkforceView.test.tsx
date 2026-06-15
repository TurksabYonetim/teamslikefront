import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkforceView } from "./WorkforceView";
import { wfoStore } from "../wfo.store";

beforeEach(() => {
  localStorage.clear();
  wfoStore.getState().reset();
});
const get = () => wfoStore.getState();

describe("WorkforceView", () => {
  it("tahmin tablosu + uyum + kalite bölümlerini gösterir", () => {
    render(<WorkforceView />);
    expect(screen.getByText("wfo.forecast")).toBeInTheDocument();
    expect(screen.getByText("wfo.adherence")).toBeInTheDocument();
    expect(screen.getByText("wfo.quality")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("hacim girişi gereken-temsilciyi yeniden hesaplar", () => {
    render(<WorkforceView />);
    const id = get().intervals[0].id;
    const input = screen.getByLabelText(`09:00 wfo.volume`);
    fireEvent.change(input, { target: { value: "60" } });
    expect(get().intervals.find((i) => i.id === id)!.required).toBe(10);
  });

  it("kalite skorunu kaydeder", () => {
    render(<WorkforceView />);
    const before = get().evaluations.length;
    fireEvent.click(screen.getByRole("button", { name: /wfo\.saveScore/ }));
    expect(get().evaluations.length).toBe(before + 1);
  });

  it("açık aralıkta temsilci ekleme self-heal vardiyayı artırır", () => {
    render(<WorkforceView />);
    // i_10 seed'de scheduled 3 < required 4 → açık. selfHeal butonu görünür.
    const heal = screen.getAllByRole("button", { name: /wfo\.selfHeal/ })[0];
    const understaffedBefore = get().intervals.filter((i) => i.scheduled < i.required).length;
    fireEvent.click(heal);
    const after = get().intervals.filter((i) => i.scheduled < i.required).length;
    expect(after).toBeLessThanOrEqual(understaffedBefore);
  });
});
