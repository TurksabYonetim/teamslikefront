import { api } from "@/lib/api";
import type { MeProfile, SigningSecret, TeamUser, Tenant } from "./settings.types";

/**
 * Settings ile ilgili backend uçları.
 * Desen: src/features/auth/auth.api.ts
 */
export const settingsApi = {
  /** GET /v1/tenants/me */
  tenant: () => api.get<Tenant>("/v1/tenants/me").then((r) => r.data),

  /** GET /v1/auth/me */
  me: () => api.get<MeProfile>("/v1/auth/me").then((r) => r.data),

  /** GET /v1/users/ */
  users: () => api.get<TeamUser[]>("/v1/users/").then((r) => r.data),

  /** GET /v1/tenants/me/signing-secret */
  signingSecret: () =>
    api.get<SigningSecret>("/v1/tenants/me/signing-secret").then((r) => r.data),

  /** POST /v1/tenants/me/rotate-signing-secret */
  rotateSigningSecret: () =>
    api
      .post<SigningSecret>("/v1/tenants/me/rotate-signing-secret")
      .then((r) => r.data),
};
