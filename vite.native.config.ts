import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "native-src"),
  base: "./",
  plugins: [react()],
  // The header uses the small reviewed brand avatars at runtime. Copy only
  // those two files; native launcher/splash assets still live in each project.
  publicDir: path.resolve(__dirname, "native-public"),
  build: {
    outDir: path.resolve(__dirname, "native-web"),
    emptyOutDir: true,
    target: "es2020",
  },
});
