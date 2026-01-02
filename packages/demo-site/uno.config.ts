import { presetShadcn } from "unocss-preset-shadcn";
import {
  defineConfig,
  presetWind4,
  presetIcons,
  transformerVariantGroup,
  presetTypography,
} from "unocss";

export default defineConfig({
  transformers: [transformerVariantGroup()],
  presets: [presetWind4(), presetIcons(), presetShadcn(), presetTypography()],
  safelist: ["highlight", "line"],
  shortcuts: {
    highlight: "bg-neutral-300 rounded-sm p-1 -m-1",
    // "relative z-0 before:(content-[''] bg-neutral-300 absolute drop-shadow -z-100 inset-0 w-full block .-mx-10) w-full inline-block bg-blend-lighten"
    // "relative z-0 bg-neutral-300 rounded-sm .px-1 .-mx-1 [&.line]:inline-flex h-full w-full",
    // "relative z-0 before:(content-[''] absolute -inset-0.5 bg-neutral-300 rounded-sm -z-100 .w-full [&.line]:inline-flex) w-full [&.line]:inline-flex .bg-neutral-300 .rounded-sm .p-1 .-m-1 .-z-10",
  },
  theme: { breakpoint: { md: "38rem" } },
});
