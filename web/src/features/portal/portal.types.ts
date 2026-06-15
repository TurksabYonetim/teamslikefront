/** Portal (müşteri destek portalı) tip tanımları. */

/** GET /v1/portal/me/whoami — doğrulanan müşteri kimliği (backend yanıtı). */
export interface PortalWhoami {
  tenant_id?: string;
  tenant_slug?: string;
  external_sub?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

/** GET /v1/portal/me/tenants */
export interface PortalTenant {
  tenant_id: string;
  slug: string;
  name: string;
}

/** GET /v1/portal/me/sellers */
export interface PortalSeller {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  tenant?: { tenant_id?: string; slug?: string; name?: string } | null;
}

/**
 * Normalize edilmiş thread (UI modeli). Backend "object" döndürür; gerçek
 * şema: { id, status, seller:{user_id,full_name,...}, last_message:{...} }.
 * api.ts içindeki normalizeThread() bunu üretir.
 */
export interface PortalThread {
  conversation_id: number;
  seller_user_id?: string | null;
  seller_name?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  status?: string | null;
}

/**
 * Normalize edilmiş mesaj (UI modeli). Backend mesajı:
 * { id, content, created_at:<epoch>, sender:{ type:"contact"|"agent_bot"|... } }.
 */
export interface PortalMessage {
  id: string | number;
  content: string;
  /** true = müşteri (mine), false = temsilci. */
  mine?: boolean;
  created_at?: string | null;
}

/** POST /v1/portal/me/threads */
export interface StartThreadRequest {
  seller_user_id: string;
  initial_message?: string | null;
}
