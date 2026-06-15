import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    // tünel (localhost.run / ngrok / cloudflared vb.) domain'lerini kabul et
    allowedHosts: true,
    // tl-api CORS'a localhost:5173 origin'ine izin vermediği için, API
    // çağrılarını dev sunucusu üzerinden proxy'liyoruz (same-origin → CORS yok).
    // Frontend `/v1/...` çağırır, Vite bunu tl-api'ye sunucu tarafında iletir.
    proxy: {
      "/v1": {
        target: "https://tl-api.turksab.com",
        changeOrigin: true,
        secure: true,
      },
      "/health": { target: "https://tl-api.turksab.com", changeOrigin: true, secure: true },
      "/ready": { target: "https://tl-api.turksab.com", changeOrigin: true, secure: true },
    },
  },
});
