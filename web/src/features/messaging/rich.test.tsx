// web/src/features/messaging/rich.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichText } from "./rich";

describe("RichText", () => {
  it("renders bold and italic", () => {
    render(<RichText text="hello **world** and *you*" />);
    expect(screen.getByText("world").tagName).toBe("STRONG");
    expect(screen.getByText("you").tagName).toBe("EM");
  });

  it("renders inline code", () => {
    render(<RichText text="run `npm test` now" />);
    expect(screen.getByText("npm test").tagName).toBe("CODE");
  });

  it("renders links with safe attributes", () => {
    render(<RichText text="see [docs](https://x.dev)" />);
    const a = screen.getByText("docs") as HTMLAnchorElement;
    expect(a.tagName).toBe("A");
    expect(a.getAttribute("href")).toBe("https://x.dev");
    expect(a.getAttribute("rel")).toContain("noopener");
  });

  it("highlights @mentions", () => {
    render(<RichText text="hi @defne" />);
    expect(screen.getByText("@defne")).toBeInTheDocument();
  });

  it("renders plain text unchanged", () => {
    render(<RichText text="just text" />);
    expect(screen.getByText("just text")).toBeInTheDocument();
  });
});
