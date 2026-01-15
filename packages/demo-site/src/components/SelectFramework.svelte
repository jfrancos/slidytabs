<script lang="ts">
  import { onMount } from "svelte";
  import { slider } from "slidytabs";
  import { frameworks, type Framework } from "@/lib/store";
  import { icons } from "@/lib/utils";
  import { Root, List, Trigger } from "@/shadcn-svelte/tabs";
  import { persistentAtom } from "@nanostores/persistent";
  const defaultFramework = "react";

  const { filename }: { filename: string } = $props();
  const frameworkAtom = $derived(
    persistentAtom<Framework>(`framework:${filename}`, defaultFramework)
  );
  const updateState = () => {
    for (const framework of frameworks) {
      const docs = [
        ...document.querySelectorAll(`[data-docs="${filename}:${framework}"]`),
      ] as HTMLElement[];
      for (const doc of docs) {
        if (framework === $frameworkAtom) {
          doc.classList?.remove("opacity-0");
          doc.classList?.remove("z-0");
          doc.classList?.add("z-100");
        } else {
          doc.classList?.add("opacity-0");
          doc.classList?.add("z-0");
          doc.classList?.remove("z-100");
        }
      }
    }
  };
  onMount(updateState);
</script>

<Root
  {@attach slider()}
  class="items-end"
  bind:value={
    () => $frameworkAtom,
    (newValue) => {
      frameworkAtom.set(newValue);
      updateState();
    }
  }
>
  <List class="*:px-2 *:gap-1 sm:*:px-4 sm:*:gap-2 *:h-7 rounded-md text-sm">
    {#each frameworks as framework}
      <Trigger
        value={framework}
        data-state={framework === "react" ? "active" : "inactive"}
      >
        <div class={icons[framework]}></div>
        {framework[0].toUpperCase() + framework.slice(1)}
      </Trigger>
    {/each}
  </List>
</Root>
