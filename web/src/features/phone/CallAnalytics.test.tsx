import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { CallAnalytics } from "./CallAnalytics";
import type { CallLog } from "./phone.types";

const LOGS: CallLog[] = [
  { id: "l1", direction: "inbound", peer_number: "+1", peer_name: null, duration_s: 60, started_at: "2026-06-01T09:30:00Z", created_at: "2026-06-01T09:30:00Z" },
  { id: "l2", direction: "outbound", peer_number: "+2", peer_name: null, duration_s: 120, started_at: "2026-06-01T10:00:00Z", created_at: "2026-06-01T10:00:00Z" },
  { id: "l3", direction: "missed", peer_number: "+3", peer_name: null, duration_s: 0, started_at: "2026-06-01T11:00:00Z", created_at: "2026-06-01T11:00:00Z" },
];

let mockState: { data: CallLog[] | undefined; isLoading: boolean; isError: boolean } = {
  data: LOGS, isLoading: false, isError: false,
};
vi.mock("./phone.hooks", () => ({
  useCallLogs: () => mockState,
}));

beforeEach(async () => {
  await i18n.changeLanguage("en");
  mockState = { data: LOGS, isLoading: false, isError: false };
});
afterEach(() => cleanup());

describe("CallAnalytics", () => {
  it("gerçek call-logs'tan istatistik kartları gösterir", () => {
    render(<CallAnalytics />);
    expect(screen.getByText("Total calls")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("boş veride EmptyState gösterir", () => {
    mockState = { data: [], isLoading: false, isError: false };
    render(<CallAnalytics />);
    expect(screen.getByText("No call data")).toBeInTheDocument();
  });

  it("yüklenirken hata atmaz (boş değil)", () => {
    mockState = { data: undefined, isLoading: true, isError: false };
    const { container } = render(<CallAnalytics />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it("recorded KPI kartını gösterir", () => {
    render(<CallAnalytics />);
    expect(screen.getByText("Recorded")).toBeInTheDocument();
  });

  it("PBX kuyruğu SLA listesini gösterir (maxWaitSec hedefi)", () => {
    render(<CallAnalytics />);
    expect(screen.getByText("Queue SLA")).toBeInTheDocument();
    // seed kuyruğu SLA hedefi 05:00 (300 sn)
    expect(screen.getByText(/SLA target: 05:00/)).toBeInTheDocument();
  });
});
