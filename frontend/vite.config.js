// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Fail rather than silently switching to 5174
    host: "0.0.0.0",  // Listen on both IPv4 (127.0.0.1) and IPv6 (localhost)
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
