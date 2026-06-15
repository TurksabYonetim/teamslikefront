// web/src/lib/authStore.ts
// Frontend-only oturum/izin store'u. Gerçek oturum (react-query `useMe`) backend
// geldiğinde buraya beslenebilir; şimdilik demo kullanıcı (admin) ile tohumlanır.
// Guard bileşenleri `useCan(perm)` / `can(perm)` üzerinden bu store'u okur.
import { createStore, useStore } from "@/lib/createStore";
import type { AuthUser, UserRole } from "@/features/auth/auth.types";
import { roleCan, type Permission } from "./permissions";

const STORAGE_KEY = "tl.auth.role.v1";

/** Backend olmadan UI'ı gezmek için sahte oturum kullanıcısı. */
const DEMO_USER: AuthUser = {
  id: "u-demo",
  email: "demo@acme.com",
  full_name: "Demo Kullanıcı",
  role: "admin",
  tenant_id: "t-demo",
};

function loadRole(): UserRole {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "owner" || raw === "admin" || raw === "member") return raw;
  } catch {
    /* SSR/test ortamı */
  }
  return DEMO_USER.role;
}

interface AuthState {
  user: AuthUser;
  /** Demo amaçlı rol değiştirme (izin guard'larını test etmek için). */
  setRole: (role: UserRole) => void;
  setUser: (user: AuthUser) => void;
}

export const authStore = createStore<AuthState>((set) => ({
  user: { ...DEMO_USER, role: loadRole() },
  setRole: (role) => {
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      /* yoksay */
    }
    set((s) => ({ user: { ...s.user, role } }));
  },
  setUser: (user) => set({ user }),
}));

/** React-dışı imperatif kontrol (örn. event handler içinde). */
export function can(perm: Permission): boolean {
  return roleCan(authStore.getState().user.role, perm);
}

/** Oturum kullanıcısını seç. */
export function useAuthUser(): AuthUser {
  return useStore(authStore, (s) => s.user);
}

/** Bir yetkiye sahip olup olmadığını reaktif olarak izle. */
export function useCan(perm: Permission): boolean {
  return useStore(authStore, (s) => roleCan(s.user.role, perm));
}
