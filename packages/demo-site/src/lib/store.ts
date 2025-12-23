import { atom } from "nanostores";

export const frameworks = ["react", "vue", "svelte", "astro"];

export type Framework = (typeof frameworks)[number];

// export type Framework = "svelte" | "react" | "vue";
export const frameworkAtom = atom<Framework>("react");
export function setFramework(framework: Framework) {
  frameworkAtom.set(framework);
}
