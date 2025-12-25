import { atom } from "nanostores";

export const frameworks = ["react", "vue", "svelte", "astro"] as const;

export type Framework = (typeof frameworks)[number];

export const frameworkAtom = atom<Framework>("react");
export function setFramework(framework: Framework) {
  frameworkAtom.set(framework);
}
