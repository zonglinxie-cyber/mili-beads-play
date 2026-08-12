import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "native-src"),
  base: "./",
  plugins: [react()],
  // Native icons and splash assets are provided by the platform projects.
  // Do not copy web-only social cards and PWA assets into every app install.
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, "native-web"),
    emptyOutDir: true,
    target: "es2020",
  },
});
