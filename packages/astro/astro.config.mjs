// @ts-check
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), UnoCSS({ injectReset: true }), react()],
});