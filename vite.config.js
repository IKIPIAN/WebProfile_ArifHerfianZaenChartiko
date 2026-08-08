import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Situs ini tayang di akar domainnya sendiri, bukan di sub-folder.
  base: "/",
  build: { outDir: "dist" },
});
