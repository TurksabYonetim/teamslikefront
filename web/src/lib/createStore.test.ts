// web/src/lib/createStore.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createStore, useStore } from "./createStore";

interface S {
  count: number;
  items: number[];
  inc: () => void;
  addItem: (n: number) => void;
}

function makeStore() {
  return createStore<S>((set, get) => ({
    count: 0,
    items: [1, 2, 3],
    inc: () => set({ count: get().count + 1 }),
    addItem: (n) => set({ items: [...get().items, n] }),
  }));
}

describe("createStore", () => {
  it("exposes initial state via getState", () => {
    const store = makeStore();
    expect(store.getState().count).toBe(0);
  });

  it("updates state through actions and notifies subscribers", () => {
    const store = makeStore();
    const seen: number[] = [];
    const unsub = store.subscribe(() => seen.push(store.getState().count));
    store.getState().inc();
    store.getState().inc();
    expect(store.getState().count).toBe(2);
    expect(seen).toEqual([1, 2]);
    unsub();
    store.getState().inc();
    expect(seen).toEqual([1, 2]); // no notification after unsubscribe
  });

  it("supports functional setState", () => {
    const store = makeStore();
    store.setState((s) => ({ count: s.count + 5 }));
    expect(store.getState().count).toBe(5);
  });

  it("useStore returns a stable reference for a deriving selector across renders", () => {
    const store = makeStore();
    let renders = 0;
    const { result, rerender } = renderHook(() => {
      renders++;
      // Türetilmiş selector: her çağrıda YENİ array üretir.
      return useStore(store, (s) => s.items.filter((n) => n > 1));
    });
    const first = result.current;
    expect(first).toEqual([2, 3]);
    // İlgisiz re-render → aynı referans (snapshot önbelleği sayesinde döngü yok).
    rerender();
    expect(result.current).toBe(first);
    // İlgili mutasyon → yeni referans + güncel içerik.
    act(() => store.getState().addItem(9));
    expect(result.current).not.toBe(first);
    expect(result.current).toEqual([2, 3, 9]);
    expect(renders).toBeGreaterThan(0);
  });
});
