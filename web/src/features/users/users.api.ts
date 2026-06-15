import { api } from "@/lib/api";

/** Backend kullanıcı şeması (GET/POST /v1/users/ → contracts). */
export interface ApiUser {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

/** POST /v1/users/ gövdesi (contracts). role opsiyonel. */
export interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export const usersApi = {
  /** GET /v1/users/ — tenant kullanıcı listesi. */
  list: () => api.get<ApiUser[]>("/v1/users/").then((r) => r.data),

  /** GET /v1/users/{id} — tek kullanıcı detayı. */
  get: (id: string) =>
    api.get<ApiUser>(`/v1/users/${id}`).then((r) => r.data),

  /** POST /v1/users/ — yeni kullanıcı oluşturur (201). */
  create: (body: CreateUserRequest) =>
    api.post<ApiUser>("/v1/users/", body).then((r) => r.data),
};
