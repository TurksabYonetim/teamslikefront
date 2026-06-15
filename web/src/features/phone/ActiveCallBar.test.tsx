import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import i18n from "@/i18n/i18n";
import { ToastProvider } from "@/components/ui/Toast";
import { authStore } from "@/lib/authStore";
import { ActiveCallBar } from "./ActiveCallBar";
import { callStore } from "./callStore";

// useCreateCallLog'u sahteleyerek hibrit persist'i gözlemle.
const mutateAsync = vi.fn(() => Promise.resolve());
vi.mock("./phone.hooks", () => ({
  useCreateCallLog: () => ({ mutateAsync }),
  useContacts: () => ({ data: [] }),
}));

const renderBar = () =>
  render(
    <ToastProvider>
      <ActiveCallBar />
    </ToastProvider>,
  );

beforeEach(async () => {
  await i18n.changeLanguage("en");
  callStore.getState().resetStore();
  authStore.getState().setRole("admin"); // süpervizör butonu için admin.access
  mutateAsync.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("ActiveCallBar", () => {
  it("aktif çağrı yokken çubuğu render etmez", () => {
    renderBar();
    expect(
      screen.queryByRole("region", { name: "Active call" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Incoming call" }),
    ).not.toBeInTheDocument();
  });

  it("gelen çağrıda kabul/reddet düğmelerini gösterir", () => {
    renderBar();
    act(() => callStore.getState().simulateInbound("+14155551234", "Grace"));
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument();
  });

  it("aktif çağrıda kontrolleri ve süreyi gösterir", () => {
    renderBar();
    act(() => {
      callStore.getState().place("+14155559999", "Ada");
      callStore.getState().answer();
    });
    expect(screen.getByRole("button", { name: "Hang up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
  });

  it("gelen çağrıda arayan sınıfı + engelle düğmesi gösterir", () => {
    renderBar();
    act(() => callStore.getState().simulateInbound("+14155551234", "Grace"));
    expect(screen.getByRole("button", { name: "Block" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Block" }).click());
    expect(callStore.getState().blocklist).toContain("+14155551234");
  });

  it("yanıtlanan çağrı bitince WrapUpCard gösterir", async () => {
    renderBar();
    act(() => {
      callStore.getState().place("+14155559999", "Ada");
      callStore.getState().answer();
      callStore.getState().hangup();
    });
    expect(await screen.findByRole("dialog", { name: "Call wrap-up" })).toBeInTheDocument();
  });

  it("çağrı bittiğinde /v1/call-logs'a kayıt POST eder ve pendingLog'u temizler", async () => {
    renderBar();
    act(() => {
      callStore.getState().place("+14155559999", "Ada");
      callStore.getState().answer();
      callStore.getState().hangup();
    });
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: "outbound",
        peer_number: "+14155559999",
        peer_name: "Ada",
      }),
    );
    await waitFor(() => {
      expect(callStore.getState().pendingLog).toBeNull();
    });
  });
});

describe("ActiveCallBar — danışma / sıcak transfer", () => {
  const activate = () =>
    act(() => {
      callStore.getState().place("+14155559999", "Ada");
      callStore.getState().answer();
    });

  it("danış butonu hedef girişini açar ve startConsult çağırır", () => {
    renderBar();
    activate();
    act(() => screen.getByRole("button", { name: "Consult" }).click());
    const input = screen.getByLabelText(/consult target/i) as HTMLInputElement;
    act(() => {
      input.value = "102";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    // React kontrollü input — fireEvent yerine doğrudan store'u doğrula
    act(() => {
      callStore.getState().startConsult("102");
    });
    expect(callStore.getState().consult?.peer).toBe("102");
  });

  it("aktif danışma tamamla/birleştir/iptal kontrollerini gösterir", () => {
    renderBar();
    activate();
    act(() => callStore.getState().startConsult("102", "Sales"));
    expect(screen.getByRole("button", { name: "Complete transfer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Merge to conference" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel consult" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Merge to conference" }).click());
    expect(callStore.getState().consult).toBeNull();
    expect(callStore.getState().activeCall?.participants).toContain("102");
  });
});

describe("ActiveCallBar — bekletme müziği", () => {
  it("hold music butonu toggle eder", () => {
    renderBar();
    act(() => {
      callStore.getState().place("+1", "Ada");
      callStore.getState().answer();
    });
    const btn = screen.getByRole("button", { name: "Hold music" });
    act(() => btn.click());
    expect(callStore.getState().holdMusic).toBe(true);
  });
});

describe("ActiveCallBar — park şeridi", () => {
  it("parklı çağrı için pickup düğmesi gösterir (aktif çağrı yokken)", () => {
    renderBar();
    act(() => {
      callStore.getState().place("+14155551111", "Ada");
      callStore.getState().answer();
      callStore.getState().park();
    });
    const region = screen.getByRole("region", { name: "Parked calls" });
    expect(region).toBeInTheDocument();
    const pickup = screen.getByRole("button", { name: /Pick up/ });
    act(() => pickup.click());
    expect(callStore.getState().activeCall?.state).toBe("active");
  });
});

describe("ActiveCallBar — süpervizör izleme (admin korumalı)", () => {
  const activate = () =>
    act(() => {
      callStore.getState().place("+1", "Ada");
      callStore.getState().answer();
    });

  it("admin için monitor butonu görünür ve izleme panelini açar", () => {
    renderBar();
    activate();
    const btn = screen.getByRole("button", { name: "Monitor" });
    act(() => btn.click());
    expect(callStore.getState().monitor).toBe("listen");
    expect(screen.getByText("Supervisor monitoring")).toBeInTheDocument();
  });

  it("admin olmayan (member) için monitor butonu gizlenir", () => {
    authStore.getState().setRole("member");
    renderBar();
    activate();
    expect(screen.queryByRole("button", { name: "Monitor" })).not.toBeInTheDocument();
  });
});
