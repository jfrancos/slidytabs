import { atom } from "nanostores";

export type Framework = "svelte" | "react" | "vue";
export const $framework = atom<Framework>("react");
export function setFramework(framework: Framework) {
  $framework.set(framework);
}
