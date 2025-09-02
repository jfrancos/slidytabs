import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import unocss from "unocss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), unocss()],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
});

// console.log(path.resolve("./src"));
