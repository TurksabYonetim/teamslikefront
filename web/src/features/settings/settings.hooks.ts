import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { settingsApi } from "./settings.api";
import type { MeProfile, SigningSecret, TeamUser, Tenant } from "./settings.types";

const TENANT_KEY = ["settings", "tenant"] as const;
const ME_KEY = ["settings", "me"] as const;
const USERS_KEY = ["settings", "users"] as const;
const SECRET_KEY = ["settings", "signing-secret"] as const;

/** GET /v1/tenants/me */
export function useTenant() {
  return useQuery<Tenant>({
    queryKey: TENANT_KEY,
    queryFn: settingsApi.tenant,
    staleTime: 5 * 60_000,
  });
}

/** GET /v1/auth/me */
export function useMeProfile() {
  return useQuery<MeProfile>({
    queryKey: ME_KEY,
    queryFn: settingsApi.me,
    staleTime: 5 * 60_000,
  });
}

/** GET /v1/users/ — ekip listesi. */
export function useTeamUsers() {
  return useQuery<TeamUser[]>({
    queryKey: USERS_KEY,
    queryFn: settingsApi.users,
    staleTime: 60_000,
  });
}

/**
 * Oturum açan kullanıcının tam profili: /v1/auth/me ile /v1/users/ kayıtları
 * eşleştirilerek `full_name` elde edilir (auth/me bunu döndürmez).
 */
export function useCurrentUser() {
  const meQ = useMeProfile();
  const usersQ = useTeamUsers();
  const fullUser = useMemo<TeamUser | undefined>(() => {
    if (!meQ.data || !usersQ.data) return undefined;
    return usersQ.data.find((u) => u.id === meQ.data!.user_id);
  }, [meQ.data, usersQ.data]);

  return {
    me: meQ.data,
    fullUser,
    isLoading: meQ.isLoading || usersQ.isLoading,
    error: meQ.error ?? usersQ.error,
  };
}

/** GET /v1/tenants/me/signing-secret */
export function useSigningSecret() {
  return useQuery<SigningSecret>({
    queryKey: SECRET_KEY,
    queryFn: settingsApi.signingSecret,
    staleTime: 5 * 60_000,
  });
}

/**
 * POST /v1/tenants/me/rotate-signing-secret — başarıda cache güncellenir,
 * böylece "Göster" alanı yeni secret'ı anında yansıtır.
 */
export function useRotateSigningSecret() {
  const qc = useQueryClient();
  return useMutation<SigningSecret>({
    mutationFn: settingsApi.rotateSigningSecret,
    onSuccess: (data) => {
      qc.setQueryData(SECRET_KEY, data);
    },
  });
}

/* ──────────────────────────────────────────────────────────────────────────
 * localStorage tabanlı tercih: tenant görünen adı.
 * Backend'de tenant GÜNCELLEME ucu YOK (sadece GET /v1/tenants/me var), bu
 * yüzden "Değişiklikleri kaydet" yerel olarak saklanır.
 * ────────────────────────────────────────────────────────────────────────── */

const NAME_OVERRIDE_KEY = "tl_settings_tenant_name";
const nameListeners = new Set<() => void>();

function readNameOverride(): string | null {
  try {
    return localStorage.getItem(NAME_OVERRIDE_KEY);
  } catch {
    return null;
  }
}

function subscribeName(listener: () => void): () => void {
  nameListeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === NAME_OVERRIDE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    nameListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Tenant görünen adı override'ı (localStorage). `serverName` verilirse, override
 * yoksa onu döner. `set` ile kaydedilir; `null`/boş ile sunucu değerine döner.
 */
export function useTenantNameOverride(serverName?: string) {
  const stored = useSyncExternalStore(subscribeName, readNameOverride, () => null);

  const value = stored ?? serverName ?? "";

  const set = useCallback((next: string | null) => {
    try {
      if (next == null || next === "") localStorage.removeItem(NAME_OVERRIDE_KEY);
      else localStorage.setItem(NAME_OVERRIDE_KEY, next);
    } catch {
      /* private mode / kota — sessizce geç */
    }
    nameListeners.forEach((l) => l());
  }, []);

  return { value, override: stored, set, isOverridden: stored != null };
}
