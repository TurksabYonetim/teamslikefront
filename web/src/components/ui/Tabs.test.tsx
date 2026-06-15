import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Tabs } from "./Tabs";

const items = [
  { id: "a", label: "Genel", content: <div>genel-içerik</div> },
  { id: "b", label: "Ekip", content: <div>ekip-içerik</div> },
];

describe("Tabs", () => {
  it("ilk sekmenin içeriğini gösterir", () => {
    render(<Tabs items={items} />);
    expect(screen.getByText("genel-içerik")).toBeInTheDocument();
  });

  it("sekmeye tıklayınca içerik değişir", async () => {
    render(<Tabs items={items} />);
    await userEvent.click(screen.getByRole("tab", { name: "Ekip" }));
    expect(screen.getByText("ekip-içerik")).toBeInTheDocument();
  });

  it("ok tuşu ile sonraki sekmeye geçer", async () => {
    render(<Tabs items={items} />);
    const first = screen.getByRole("tab", { name: "Genel" });
    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Ekip" })).toHaveFocus();
  });
});
