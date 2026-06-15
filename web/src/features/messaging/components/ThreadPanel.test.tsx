import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThreadPanel } from "./ThreadPanel";
import { messagingStore } from "../store";

const S = () => messagingStore.getState();

beforeEach(() => S().resetStore());

const renderPanel = () => render(<MemoryRouter><ThreadPanel /></MemoryRouter>);

describe("ThreadPanel", () => {
  it("renders the root message and a reply composer when a thread is open", () => {
    const root = S().messages[0];
    S().openThread(root.id);
    renderPanel();
    expect(screen.getAllByText(/thread\.title|thread/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("sending a reply appends a parented message to the store", () => {
    const root = S().messages[0];
    S().openThread(root.id);
    const before = S().messages.filter((m) => m.parentId === root.id).length;
    renderPanel();
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "thread cevabı" } });
    fireEvent.keyDown(ta, { key: "Enter" });
    const after = S().messages.filter((m) => m.parentId === root.id);
    expect(after.length).toBe(before + 1);
    expect(after[after.length - 1].body).toBe("thread cevabı");
  });
});
