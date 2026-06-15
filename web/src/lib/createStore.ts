// web/src/lib/createStore.ts
import { useRef, useSyncExternalStore } from "react";

type Listener = () => void;
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;

export interface Store<T> {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: Listener) => () => void;
}

/**
 * Bağımlılıksız, zustand-benzeri küçük store. Durum React ağacı dışında yaşar;
 * bileşenler `useStore(store, selector)` ile abone olur (useSyncExternalStore).
 */
export function createStore<T>(
  init: (set: SetState<T>, get: GetState<T>) => T,
): Store<T> {
  let state: T;
  const listeners = new Set<Listener>();

  const getState: GetState<T> = () => state;
  const setState: SetState<T> = (partial) => {
    const next = typeof partial === "function" ? (partial as (s: T) => Partial<T>)(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = init(setState, getState);
  return { getState, setState, subscribe };
}

/**
 * React bağlama: store'dan bir dilim seç ve değiştiğinde re-render ol.
 *
 * Snapshot, state kimliği üzerinden önbelleklenir: `setState` her değişimde YENİ
 * bir state ref'i üretir, değişim olmadığında AYNI ref'i korur. Böylece türetilmiş
 * (deriving) selector'lar — örn. `s => s.messages.filter(...)` — render'lar arasında
 * kararlı bir referans döndürür ve `useSyncExternalStore`'un "getSnapshot should be
 * cached" döngüsüne düşmesi engellenir. İsteğe bağlı `isEqual`, içerik aynı kaldığında
 * gereksiz re-render'ı da önler (varsayılan `Object.is`).
 */
export function useStore<T, U>(
  store: Store<T>,
  selector: (state: T) => U,
  isEqual: (a: U, b: U) => boolean = Object.is,
): U {
  const cache = useRef<{ state: T; value: U } | null>(null);

  const getSnapshot = (): U => {
    const state = store.getState();
    const prev = cache.current;
    if (prev && prev.state === state) return prev.value;
    const value = selector(state);
    if (prev && isEqual(prev.value, value)) {
      // İçerik aynı → eski ref'i koru ama state kimliğini güncelle.
      cache.current = { state, value: prev.value };
      return prev.value;
    }
    cache.current = { state, value };
    return value;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
