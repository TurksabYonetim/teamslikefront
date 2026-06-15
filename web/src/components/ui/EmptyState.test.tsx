import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("başlık ve açıklamayı gösterir", () => {
    render(<EmptyState title="Kayıt yok" description="Henüz veri eklenmedi." />);
    expect(screen.getByText("Kayıt yok")).toBeInTheDocument();
    expect(screen.getByText("Henüz veri eklenmedi.")).toBeInTheDocument();
  });

  it("aksiyon verildiğinde butonu render eder", () => {
    render(
      <EmptyState title="Boş" action={<button>Ekle</button>} />,
    );
    expect(screen.getByRole("button", { name: "Ekle" })).toBeInTheDocument();
  });
});
