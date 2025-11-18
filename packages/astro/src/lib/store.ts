import { atom } from "nanostores";

export type Framework = "svelte" | "react";
export const $framework = atom<Framework>("svelte");
export function setFramework(framework: Framework) {
  $framework.set(framework);
}
