import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileMessage } from "./FileMessage";

describe("FileMessage", () => {
  it("shows file name and size in KB under 1MB", () => {
    render(<FileMessage file={{ name: "rapor.pdf", fileType: "pdf", sizeKb: 240 }} />);
    expect(screen.getByText("rapor.pdf")).toBeInTheDocument();
    expect(screen.getByText(/240 KB/)).toBeInTheDocument();
  });

  it("formats size in MB over 1024 KB", () => {
    render(<FileMessage file={{ name: "video.mp4", fileType: "mp4", sizeKb: 2048 }} />);
    expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument();
  });

  it("renders an image thumbnail for image files", () => {
    const { container } = render(
      <FileMessage file={{ name: "foto.png", fileType: "png", sizeKb: 80, isImage: true }} />,
    );
    expect(screen.getByText("foto.png")).toBeInTheDocument();
    expect(container.querySelector("[data-thumb]")).not.toBeNull();
  });
});
