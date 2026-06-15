import axios, { AxiosError } from "axios";
import { config } from "@/config";
import { tokenStore } from "@/lib/token";

/**
 * Merkezi axios instance.
 * - baseURL env'den gelir
 * - Her isteğe staff JWT (varsa) Bearer olarak eklenir
 * - 401 → token temizlenir ve login'e yönlendirilir
 */
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = tokenStore.get();
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      // Login dışındaysa yönlendir
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/** FastAPI hata gövdesinden okunabilir mesaj çıkarır. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return error.message;
  }
  return "Beklenmeyen bir hata oluştu.";
}
