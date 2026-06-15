// web/src/lib/tenantStore.ts
// Frontend-only çoklu çalışma alanı (multi-tenant) store'u. `workspaceId === null`
// "tüm alanlar" anlamına gelir (varsayılan), böylece filtreleme bağlanmadan mevcut
// davranış korunur. Sekmeler `useWorkspaceId()` ile aktif alanı okuyup filtreler.
import { createStore, useStore } from "@/lib/createStore";

export interface Workspace {
  id: string;
  name: string;
}

export const WORKSPACES: Workspace[] = [
  { id: "ws_core", name: "Çekirdek" },
  { id: "ws_growth", name: "Büyüme" },
];

const STORAGE_KEY = "tl.tenant.workspace.v1";

function loadWorkspaceId(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "" || raw === null) return null;
    return raw;
  } catch {
    return null;
  }
}

interface TenantState {
  workspaceId: string | null;
  workspaces: Workspace[];
  setWorkspace: (id: string | null) => void;
}

export const tenantStore = createStore<TenantState>((set) => ({
  workspaceId: loadWorkspaceId(),
  workspaces: WORKSPACES,
  setWorkspace: (id) => {
    try {
      localStorage.setItem(STORAGE_KEY, id ?? "");
    } catch {
      /* yoksay */
    }
    set({ workspaceId: id });
  },
}));

/** Aktif çalışma alanı kimliği (null = tüm alanlar). */
export function useWorkspaceId(): string | null {
  return useStore(tenantStore, (s) => s.workspaceId);
}

/** Çalışma alanı listesi + aktif seçim + değiştirici. */
export function useTenant(): TenantState {
  return useStore(tenantStore, (s) => s);
}

/**
 * Bir kaydın aktif çalışma alanında görünür olup olmadığı. `workspaceId` null ise
 * (tüm alanlar) her şey görünür; kaydın alanı yoksa (global) yine görünür.
 */
export function inActiveWorkspace(
  recordWorkspaceId: string | null | undefined,
  activeWorkspaceId: string | null,
): boolean {
  if (activeWorkspaceId === null) return true;
  if (recordWorkspaceId == null) return true;
  return recordWorkspaceId === activeWorkspaceId;
}
