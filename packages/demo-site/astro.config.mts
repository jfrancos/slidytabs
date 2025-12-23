import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), react(), UnoCSS({ injectReset: true }), vue()],
});
