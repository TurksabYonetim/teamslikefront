import { config } from "@/config";

/** Staff access/refresh token'larını localStorage'da yönetir. */
export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(config.tokenKey);
  },
  getRefresh(): string | null {
    return localStorage.getItem(config.refreshKey);
  },
  set(access: string, refresh?: string) {
    localStorage.setItem(config.tokenKey, access);
    if (refresh) localStorage.setItem(config.refreshKey, refresh);
  },
  clear() {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.refreshKey);
  },
};
