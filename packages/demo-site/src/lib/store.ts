import { persistentAtom } from "@nanostores/persistent";

const defaultFramework = "react";
export const frameworks = ["react", "vue", "svelte", "astro"] as const;
export type Framework = (typeof frameworks)[number];
export const frameworkAtom = persistentAtom<Framework>(
  "framework",
  defaultFramework
);
if (!frameworks.includes(frameworkAtom.get())) {
  frameworkAtom.set(defaultFramework);
}
export function setFramework(framework: Framework) {
  frameworkAtom.set(framework);
}
