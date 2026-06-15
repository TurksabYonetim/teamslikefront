/** Settings feature tipleri — backend şemalarına göre. */

/** GET /v1/tenants/me */
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

/** GET /v1/tenants/me/signing-secret · POST /v1/tenants/me/rotate-signing-secret */
export interface SigningSecret {
  tenant_id: string;
  slug: string;
  signing_secret: string;
  note?: string;
}

/** GET /v1/auth/me — oturum açan kullanıcının kimliği. */
export interface MeProfile {
  user_id: string;
  tenant_id: string;
  email: string;
  role: string;
}

/** GET /v1/users/ — ekip üyesi kaydı (full_name buradan gelir). */
export interface TeamUser {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Tenant adı için backend update ucu YOK; kullanıcı tercihi localStorage'da
 * tutulur. (Bkz. settings.hooks.ts → useTenantNameOverride)
 */
export interface TenantPrefs {
  /** Kullanıcının düzenlediği görünen ad (override). */
  displayName?: string;
}
