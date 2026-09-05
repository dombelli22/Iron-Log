import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built site works whether it's served from a domain
// root or a GitHub Pages project subpath (matches manifest.json's
// start_url/scope of "./").
export default defineConfig({
  plugins: [react()],
  base: "./",
});
