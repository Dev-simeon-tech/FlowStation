import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["@flowstation/constants", "@flowstation/schemas"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // ← must match your server PORT in .env
        changeOrigin: true,
      },
    },
  },
});
