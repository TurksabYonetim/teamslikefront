// web/src/features/webinar/useUrlSelection.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { useUrlSelection } from "./useUrlSelection";

function Harness({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  useUrlSelection({ param: "event", selected, isValid: (v) => v === "ev_a" || v === "ev_b", onSelect });
  return null;
}

function UrlProbe({ onUrl }: { onUrl: (v: string | null) => void }) {
  const [params] = useSearchParams();
  onUrl(params.get("event"));
  return null;
}

describe("useUrlSelection", () => {
  it("reads a valid URL value into the app on mount", () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter initialEntries={["/webinar?event=ev_b"]}>
        <Harness selected="ev_a" onSelect={onSelect} />
      </MemoryRouter>,
    );
    expect(onSelect).toHaveBeenCalledWith("ev_b");
  });

  it("ignores an invalid URL value", () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter initialEntries={["/webinar?event=bogus"]}>
        <Harness selected="ev_a" onSelect={onSelect} />
      </MemoryRouter>,
    );
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("writes the selected value into the URL when none present", () => {
    let url: string | null = "unset";
    render(
      <MemoryRouter initialEntries={["/webinar"]}>
        <Harness selected="ev_a" onSelect={() => {}} />
        <UrlProbe onUrl={(v) => (url = v)} />
      </MemoryRouter>,
    );
    expect(url).toBe("ev_a");
  });
});
