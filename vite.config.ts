import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/config/safe": {
        target: "https://msw.dplife.org",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: { alias: { buffer: "buffer/" } },
  build: {
    assetsDir: "static",
    rollupOptions: {
      output: {
        manualChunks: {
          "safe-sdk": ["@safe-global/protocol-kit"],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
