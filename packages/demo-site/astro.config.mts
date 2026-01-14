import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import path from "path";

// https://astro.build/config
export default defineConfig({
  markdown: {
    gfm: true,
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        {
          pre(node) {
            delete node.properties.style;
          },
        },
      ],
    },
    // shikiConfig: {
    //   theme: "github-light",
    //   defaultColor: false,
    //   // themes: undefined,
    //   themes: [{ light: { theme: "github-light" } }],
    //   // cssVariables: false,
    // },
  },
  integrations: [
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
});
