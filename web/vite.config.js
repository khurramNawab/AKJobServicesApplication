import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        timeout: 10 * 60 * 1000,
        proxyTimeout: 10 * 60 * 1000,
        cookieDomainRewrite: "localhost",
        headers: {
          "X-Forwarded-Proto": "http",
          "X-Real-IP": "127.0.0.1",
        },
      },
    },
  },
});
