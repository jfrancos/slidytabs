// @ts-check
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs({ include: ["**/solid/**"] }),
    svelte({ include: ["**/svelte/**", "**/node_modules/bits-ui/**"] }),
    react({ include: ["**/tsx/**"] }),
    UnoCSS({ injectReset: true }),
  ],
});
