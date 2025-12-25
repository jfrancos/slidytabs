import { presetShadcn } from "unocss-preset-shadcn";
import {
  defineConfig,
  presetWind4,
  presetIcons,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  transformers: [transformerVariantGroup()],
  presets: [presetWind4(), presetIcons(), presetShadcn()],
  safelist: ["highlight"],
  shortcuts: { highlight: "bg-neutral-300 rounded-sm p-1 -m-1" },
  theme: { breakpoint: { md: "38rem" } },
});
