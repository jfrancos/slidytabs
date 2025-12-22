<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { frameworkAtom, frameworks, setFramework } from "A/lib/store.js";
  import { react, svelte, vue } from "../icons";
  import { slider } from "slidytabs";
  let value = $state("react");
  frameworkAtom.subscribe((newFramework) => {
    value = newFramework;
  });
</script>

<Tabs.Root
  {@attach slider({
    value: frameworks.indexOf(value),
    onValueChange: (value) => setFramework(frameworks[value]),
  })}
  value="react"
  class="items-center"
>
  <Tabs.List class="*:px-4 *:gap-2 h-8 rounded-md">
    <Tabs.Trigger value="react"
      ><div class={react}></div>
      React</Tabs.Trigger
    >
    <Tabs.Trigger value="vue"
      ><div class={vue}></div>
      Vue</Tabs.Trigger
    >
    <Tabs.Trigger value="svelte"
      ><div class={svelte}></div>
      Svelte</Tabs.Trigger
    >
  </Tabs.List>
</Tabs.Root>
