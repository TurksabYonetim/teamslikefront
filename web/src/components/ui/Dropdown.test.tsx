import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dropdown, DropdownItem } from "./Dropdown";

describe("Dropdown", () => {
  it("opens on trigger click and runs item onSelect", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown trigger={<span>menu</span>} label="Menü">
        <DropdownItem onSelect={onSelect}>Sabitle</DropdownItem>
      </Dropdown>,
    );
    // başlangıçta kapalı
    expect(screen.queryByText("Sabitle")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Menü"));
    fireEvent.click(screen.getByText("Sabitle"));
    expect(onSelect).toHaveBeenCalledOnce();
    // seçimden sonra kapanır
    expect(screen.queryByText("Sabitle")).not.toBeInTheDocument();
  });

  it("closes on outside click", () => {
    render(
      <Dropdown trigger={<span>menu</span>} label="Menü">
        <DropdownItem onSelect={() => {}}>X</DropdownItem>
      </Dropdown>,
    );
    fireEvent.click(screen.getByLabelText("Menü"));
    expect(screen.getByText("X")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("X")).not.toBeInTheDocument();
  });
});
