import "@testing-library/jest-dom/vitest";

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
