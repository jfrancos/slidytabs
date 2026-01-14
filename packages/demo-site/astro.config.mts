import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import path from "path";

// https://astro.build/config
export default defineConfig({
  markdown: {
    gfm: true,
  },
  integrations: [
    mdx({ gfm: true }),
    svelte(),
    react({ include: ["**/react/**"] }),
    vue({
      // jsx: { include: ["**/vue/**"] },
      // include: ["**/vue/**"],
    }),
    UnoCSS(),
  ],
  vite: {
    resolve: {
      alias: {
        "@base": path.resolve("../.."),
      },
    },
  },
  // root: ".",
});
