import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "native-src"),
  base: "./",
  plugins: [react()],
  publicDir: path.resolve(__dirname, "public"),
  build: {
    outDir: path.resolve(__dirname, "native-web"),
    emptyOutDir: true,
    target: "es2020",
  },
});
