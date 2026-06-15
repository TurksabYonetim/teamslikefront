/** Uygulama genel yapılandırması (env'den okunur). */
export const config = {
  // Dev'de boş bırakılır → istekler relative gider (localhost:5173/v1/...) ve
  // Vite proxy'si tl-api'ye iletir (CORS sorununu aşar). Prod'da tam URL.
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "" : "https://tl-api.turksab.com"),
  /** Staff JWT'nin localStorage anahtarı. */
  tokenKey: "tl_access_token",
  refreshKey: "tl_refresh_token",
  /** Backend olmadan UI'ı gezmek için sahte token değeri. */
  demoToken: "tl_demo_token",
} as const;
