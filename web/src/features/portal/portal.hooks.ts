import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { mintBuyerToken } from "@/lib/jwt";
import {
  portal,
  portalIdentityStore,
  portalTokenStore,
  type PortalIdentity,
} from "./portal.api";
import type { PortalMessage, StartThreadRequest } from "./portal.types";

/** Test tenant'ının güncel signing_secret'ı (rotate edilirse değişir). */
export const DEFAULT_TENANT_SLUG = "teamslike-demo";
export const DEFAULT_SIGNING_SECRET =
  "6zesRcfcIoAF87VQ1SUqVbBj_XpfZvTx68cOTbiI_z4";

/** Buyer JWT ömrü (saniye) — 1 saat. */
const PORTAL_TTL_SEC = 3600;

/** Stabil bir buyer `sub` türetir (e-postadan). Boşsa rastgele kalıcı id. */
function deriveSub(email: string): string {
  const e = email.trim().toLowerCase();
  if (e) return `buyer:${e}`;
  return `buyer:anon-${crypto.randomUUID()}`;
}

const KEYS = {
  whoami: ["portal", "whoami"] as const,
  tenants: ["portal", "tenants"] as const,
  sellers: (tenantId?: string) => ["portal", "sellers", tenantId ?? null] as const,
  threads: ["portal", "threads"] as const,
  messages: (id: number | string) => ["portal", "messages", String(id)] as const,
};

/** Portal token'ın varlığını izleyen küçük yardımcı (UI gating için). */
export function usePortalToken() {
  const qc = useQueryClient();
  const [token, setTokenState] = useState<string | null>(portalTokenStore.get());

  const setToken = (value: string) => {
    portalTokenStore.set(value);
    setTokenState(portalTokenStore.get());
    qc.invalidateQueries({ queryKey: ["portal"] });
  };
  const clearToken = () => {
    portalTokenStore.clear();
    portalIdentityStore.clear();
    setTokenState(null);
    qc.removeQueries({ queryKey: ["portal"] });
  };

  return { token, hasToken: !!token, setToken, clearToken };
}

export interface ConnectPortalInput {
  tenantSlug: string;
  signingSecret: string;
  name: string;
  email: string;
}

/**
 * Buyer kimlik girişi → JWT üret (mintBuyerToken) → token + kimliği sakla.
 *
 * GÜVENLİK NOTU: signing_secret'ı tarayıcıda kullanmak YALNIZCA DEMO içindir;
 * PROD'da buyer JWT sunucu tarafında imzalanmalıdır.
 */
export function useConnectPortal() {
  const { setToken } = usePortalToken();
  return useMutation({
    mutationFn: async (input: ConnectPortalInput): Promise<PortalIdentity> => {
      const tenantSlug = input.tenantSlug.trim();
      const signingSecret = input.signingSecret.trim();
      const email = input.email.trim();
      const name = input.name.trim();
      const sub = deriveSub(email);

      const token = await mintBuyerToken({
        signingSecret,
        tenantSlug,
        sub,
        email: email || undefined,
        name: name || undefined,
        ttlSec: PORTAL_TTL_SEC,
      });

      const identity: PortalIdentity = {
        tenantSlug,
        signingSecret,
        sub,
        email,
        name,
      };
      // Token'ı uygula; kimliği exp dolunca taze mint için sakla.
      portalTokenStore.set(token);
      portalIdentityStore.set(identity);
      setToken(token);
      return identity;
    },
  });
}


/** GET /v1/portal/me/whoami — doğrulanan müşteri kimliği. */
export function useWhoami(enabled = true) {
  return useQuery({
    queryKey: KEYS.whoami,
    queryFn: () => portal.whoami(),
    enabled: enabled && !!portalTokenStore.get(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/** GET /v1/portal/me/tenants */
export function useTenants() {
  return useQuery({
    queryKey: KEYS.tenants,
    queryFn: () => portal.tenants(),
    enabled: !!portalTokenStore.get(),
    retry: false,
  });
}

/** GET /v1/portal/me/sellers */
export function useSellers(tenantId?: string) {
  return useQuery({
    queryKey: KEYS.sellers(tenantId),
    queryFn: () => portal.sellers(tenantId),
    enabled: !!portalTokenStore.get(),
    retry: false,
  });
}

/** GET /v1/portal/me/threads */
export function useThreads() {
  return useQuery({
    queryKey: KEYS.threads,
    queryFn: () => portal.threads(),
    enabled: !!portalTokenStore.get(),
    retry: false,
  });
}

/** GET .../threads/{id}/messages */
export function useMessages(conversationId: number | string | null) {
  return useQuery({
    queryKey: KEYS.messages(conversationId ?? ""),
    queryFn: () => portal.messages(conversationId!),
    enabled: !!conversationId && !!portalTokenStore.get(),
    retry: false,
  });
}

/** POST /v1/portal/me/threads */
export function useStartThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StartThreadRequest) => portal.startThread(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.threads }),
  });
}

/**
 * POST .../threads/{id}/messages — optimistic: gönderilen mesaj listeye
 * anında "mine" olarak eklenir; hata olursa geri alınır, başarıda gerçek
 * veriyle tazelenir.
 */
export function useSendMessage(conversationId: number | string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => portal.sendMessage(conversationId!, content),
    onMutate: async (content: string) => {
      if (conversationId == null) return { previous: undefined };
      const key = KEYS.messages(conversationId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<PortalMessage[]>(key);
      const optimistic: PortalMessage = {
        id: `optimistic-${Date.now()}`,
        content,
        mine: true,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<PortalMessage[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _content, ctx) => {
      if (conversationId != null && ctx?.previous !== undefined) {
        qc.setQueryData(KEYS.messages(conversationId), ctx.previous);
      }
    },
    onSettled: () => {
      if (conversationId != null) {
        qc.invalidateQueries({ queryKey: KEYS.messages(conversationId) });
      }
      qc.invalidateQueries({ queryKey: KEYS.threads });
    },
  });
}
