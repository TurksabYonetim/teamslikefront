import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LinkPreview } from "./LinkPreview";

describe("LinkPreview", () => {
  it("shows the domain and links out safely", () => {
    render(<LinkPreview url="https://www.teamslike.dev/changelog" />);
    const a = screen.getByRole("link") as HTMLAnchorElement;
    expect(a.href).toContain("teamslike.dev");
    expect(a.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText(/teamslike\.dev/)).toBeInTheDocument();
  });
});
