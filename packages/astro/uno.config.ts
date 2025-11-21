import { defineConfig, presetWind4 } from "unocss";
import { presetShadcn } from "unocss-preset-shadcn";

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetShadcn,
  ],
  safelist: ["highlighted-word"],
  shortcuts: { "highlighted-word": "bg-neutral-200 rounded-sm p-1 -m-1" },
});
