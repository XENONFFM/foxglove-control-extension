import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "dev",
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "../dev-dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@src": path.resolve(__dirname, "src"),
    },
  },
});
