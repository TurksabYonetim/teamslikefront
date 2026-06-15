import axios, { type AxiosRequestConfig } from "axios";
import { config } from "@/config";
import { mintBuyerToken } from "@/lib/jwt";
import type {
  PortalMessage,
  PortalSeller,
  PortalTenant,
  PortalThread,
  PortalWhoami,
  StartThreadRequest,
} from "./portal.types";

/**
 * Portal uçları AYRI bir kimlik ister: müşteri/portal JWT'si.
 * Bu token, satıcının kendi backend'inde tenant signing_secret ile imzalanır
 * ve `iss` (tenant slug) claim'ini taşır. Staff JWT'si (lib/api.ts) BURADA
 * çalışmaz (backend: "Token missing 'iss' (tenant slug)" → 401).
 *
 * Bu yüzden paylaşılan `api` instance'ı yerine portal'a özel bir axios
 * instance'ı ve ayrı bir localStorage token deposu kullanıyoruz.
 */
const PORTAL_TOKEN_KEY = "tl_portal_token";

export const portalTokenStore = {
  get(): string | null {
    return localStorage.getItem(PORTAL_TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(PORTAL_TOKEN_KEY, token.trim());
  },
  clear() {
    localStorage.removeItem(PORTAL_TOKEN_KEY);
  },
};

/**
 * Buyer kimlik bilgileri — JWT'yi yeniden üretebilmek (exp dolunca taze mint)
 * için signing_secret + buyer kimliği localStorage'da saklanır.
 *
 * GÜVENLİK NOTU: signing_secret'ı tarayıcıda saklamak/kullanmak YALNIZCA DEMO
 * içindir. PROD'da buyer JWT sunucu tarafında imzalanmalı, secret istemciye
 * hiç gönderilmemelidir.
 */
const PORTAL_IDENTITY_KEY = "tl_portal_identity";

export interface PortalIdentity {
  tenantSlug: string;
  signingSecret: string;
  sub: string;
  email: string;
  name: string;
}

export const portalIdentityStore = {
  get(): PortalIdentity | null {
    const raw = localStorage.getItem(PORTAL_IDENTITY_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PortalIdentity;
    } catch {
      return null;
    }
  },
  set(identity: PortalIdentity) {
    localStorage.setItem(PORTAL_IDENTITY_KEY, JSON.stringify(identity));
  },
  clear() {
    localStorage.removeItem(PORTAL_IDENTITY_KEY);
  },
};

/** Portal'a özel axios instance — portal token'ı Bearer olarak ekler. */
export const portalApi = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

portalApi.interceptors.request.use((cfg) => {
  const token = portalTokenStore.get();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/** Saklı kimlikten buyer JWT'yi yeniden üretir (exp dolunca). */
async function remintToken(): Promise<string | null> {
  const id = portalIdentityStore.get();
  if (!id) return null;
  const token = await mintBuyerToken({
    signingSecret: id.signingSecret,
    tenantSlug: id.tenantSlug,
    sub: id.sub,
    email: id.email || undefined,
    name: id.name || undefined,
    ttlSec: 3600,
  });
  portalTokenStore.set(token);
  return token;
}

/**
 * 401 olunca (token süresi dolmuş olabilir) saklı kimlikten taze JWT mint edip
 * isteği BİR kez yeniden dener. Kimlik yoksa hatayı olduğu gibi iletir.
 */
portalApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config as
      | (AxiosRequestConfig & { _portalRetried?: boolean })
      | undefined;
    const status = error?.response?.status;
    if (status === 401 && original && !original._portalRetried) {
      original._portalRetried = true;
      const fresh = await remintToken().catch(() => null);
      if (fresh) {
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${fresh}`,
        };
        return portalApi(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Backend "object" döndüren uçlar için toleranslı dizi çıkarımı. */
function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["items", "threads", "messages", "data", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

/** Epoch (saniye) veya ISO string → ISO string (UI fmtTime ile uyumlu). */
function toIso(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v * 1000).toISOString();
  if (typeof v === "string") {
    // Saf sayı string'i (epoch) ise dönüştür.
    if (/^\d+$/.test(v)) return new Date(Number(v) * 1000).toISOString();
    return v;
  }
  return null;
}

/**
 * Backend thread'ini UI modeline normalize eder. Gerçek şema:
 *   { id, status, seller:{user_id,full_name}, last_message:{content,created_at} }
 */
function normalizeThread(raw: unknown): PortalThread {
  const t = (raw ?? {}) as Record<string, any>;
  const seller = (t.seller ?? {}) as Record<string, any>;
  const lm = t.last_message as Record<string, any> | null | undefined;
  return {
    conversation_id: Number(t.id ?? t.conversation_id ?? 0),
    seller_user_id: seller.user_id ?? t.seller_user_id ?? null,
    seller_name: seller.full_name ?? t.seller_name ?? null,
    last_message:
      (lm && typeof lm === "object" ? lm.content : (lm as string | null)) ??
      t.last_message ??
      null,
    last_message_at:
      toIso(lm && typeof lm === "object" ? lm.created_at : undefined) ??
      toIso(t.last_message_at),
    status: t.status ?? null,
  };
}

/**
 * Backend mesajını UI modeline normalize eder. "mine" = gönderen contact ise.
 * sender.type: "contact" (müşteri) | "user"/"agent_bot" (temsilci).
 */
function normalizeMessage(raw: unknown): PortalMessage {
  const m = (raw ?? {}) as Record<string, any>;
  const senderType = (m.sender?.type ?? m.sender_type ?? "")
    .toString()
    .toLowerCase();
  // Müşteri (mine) = gönderen contact. Tip yoksa message_type 0 (incoming).
  const mine = senderType
    ? senderType === "contact"
    : m.message_type === 0;
  return {
    id: m.id,
    content: m.content ?? "",
    mine,
    created_at: toIso(m.created_at),
  };
}

export const portal = {
  whoami: () =>
    portalApi.get<PortalWhoami>("/v1/portal/me/whoami").then((r) => r.data),

  tenants: () =>
    portalApi
      .get<PortalTenant[]>("/v1/portal/me/tenants")
      .then((r) => asArray<PortalTenant>(r.data)),

  sellers: (tenantId?: string) =>
    portalApi
      .get<PortalSeller[]>("/v1/portal/me/sellers", {
        params: tenantId ? { tenant_id: tenantId } : undefined,
      })
      .then((r) => asArray<PortalSeller>(r.data)),

  threads: () =>
    portalApi
      .get("/v1/portal/me/threads")
      .then((r) => asArray<unknown>(r.data).map(normalizeThread)),

  startThread: (body: StartThreadRequest) =>
    portalApi
      .post("/v1/portal/me/threads", body)
      .then((r) => normalizeThread(r.data)),

  messages: (conversationId: number | string) =>
    portalApi
      .get(`/v1/portal/me/threads/${conversationId}/messages`)
      .then((r) => asArray<unknown>(r.data).map(normalizeMessage)),

  sendMessage: (conversationId: number | string, content: string) =>
    portalApi
      .post(`/v1/portal/me/threads/${conversationId}/messages`, { content })
      .then((r) => r.data),
};
