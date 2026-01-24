<script lang="ts">
  import { onMount } from "svelte";
  import { slider } from "slidytabs";
  import { icons, frameworks, type Framework } from "@/lib/utils";
  import { Root, List, Trigger } from "@/shadcn-svelte/tabs";
  import { persistentAtom } from "@nanostores/persistent";
  const defaultFramework = "react";

  const { filename }: { filename: string } = $props();
  const frameworkAtom = $derived(
    persistentAtom<Framework>(`framework:${filename}`, defaultFramework),
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
  onMount(() => {
    for (const framework of frameworks) {
      if (location.pathname === `/${framework}`) {
        frameworkAtom.set(framework);
      }
    }
    updateState();
  });
  const setUrl = () => {
    const entries = Object.entries(localStorage)
      .filter(([key]) => key.startsWith("framework:"))
      .map(([, v]) => v);
    for (const framework of frameworks) {
      if (entries.every((item) => item === framework)) {
        history.replaceState(null, "", "/" + framework);
        return;
      }
    }
    history.replaceState(null, "", "/");
  };
</script>

<Root
  {@attach slider({
    value: frameworks.indexOf($frameworkAtom),
    onValueChange: (value) => {
      frameworkAtom.set(frameworks[value]);
      updateState();
      setUrl();
    },
  })}
  class="items-end"
  value={$frameworkAtom}
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
