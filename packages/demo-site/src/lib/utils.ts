import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// @unocss-include
export const icons = {
  svelte: "i-logos:svelte-icon",
  react: "i-logos:react?mask text-#087EA4",
  vue: "i-logos-vue",
  astro: "i-logos-astro-icon",
  github: "i-logos:github-icon",
};
