import "@testing-library/jest-dom/vitest";

// jsdom ResizeObserver stub (PanelHint vb. taşma ölçümü için; jsdom sağlamaz)
if (!("ResizeObserver" in globalThis)) {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom matchMedia stub (prefers-reduced-motion sorgularını test edebilmek için)
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
