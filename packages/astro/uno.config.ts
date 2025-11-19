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
  shortcuts: { highlighted: "bg-neutral-200 rounded-sm p-1 -m-1" },
});
