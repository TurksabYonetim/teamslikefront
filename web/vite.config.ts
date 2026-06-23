import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages proje sayfası alt-yoldan servis eder
  // (turksabyonetim.github.io/teamslikefront/). CI build'i VITE_BASE_PATH=/teamslikefront/
  // verir; lokal dev'de değişken yoktur → kök "/" kullanılır.
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Ağır 3rd-party kütüphaneleri ayrı, uzun süre cache'lenebilir chunk'lara
        // böl. Böylece bir sayfada güncelleme olduğunda echarts/fullcalendar gibi
        // devler yeniden indirilmez ve route chunk'ları şişmez.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["echarts", "echarts-for-react"],
          "vendor-calendar": [
            "@fullcalendar/core",
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
            "@fullcalendar/interaction",
            "@fullcalendar/list",
          ],
        },
      },
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
