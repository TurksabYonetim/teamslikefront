/** Backend kodu geldiğinde bu tipler gerçek şemalara göre güncellenecek. */

export type UserRole = "owner" | "admin" | "member";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id?: string;
}

export interface LoginRequest {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SignupRequest {
  tenant_slug: string;
  tenant_name: string;
  admin_full_name: string;
  admin_email: string;
  admin_password: string;
}

export interface SignupResponse {
  tokens: TokenPair;
  // backend ek alanlar dönebilir (tenant, user) — şimdilik gevşek bırakıldı
  [key: string]: unknown;
}
