import {
  defineConfig,
  presetWind4,
  presetIcons,
  transformerVariantGroup,
} from "unocss";
import { presetShadcn } from "unocss-preset-shadcn";

export default defineConfig({
  transformers: [transformerVariantGroup()],
  presets: [
    presetWind4({ preflights: { reset: true } }),
    presetIcons,
    presetShadcn,
  ],
  safelist: ["highlighted-word"],
  shortcuts: { "highlighted-word": "bg-neutral-300 rounded-sm p-1 -m-1" },
  theme: { breakpoint: { md: "38rem" } },
});
