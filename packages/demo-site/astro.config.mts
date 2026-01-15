import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import path from "path";
// import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  markdown: {
    // remarkPlugins: [remarkToc],
    remarkPlugins: [[remarkToc, { heading: "Quick start", maxDepth: 3 }]],

    // gfm: true,
    shikiConfig: {
      theme: "github-light",
    },
  },
  integrations: [
    // mdx(),
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
        "@README.md": path.resolve("../../README.md"),
      },
    },
  },
});
