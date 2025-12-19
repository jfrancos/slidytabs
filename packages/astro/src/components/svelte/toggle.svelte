<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { setFramework, type Framework } from "A/lib/store.js";
  import { react, svelte } from "../icons";
  import { slider } from "slidytabs";
</script>

<Tabs.Root
  {@attach slider()}
  value="svelte"
  class="items-center 2xl:hidden"
  onValueChange={(value) => setFramework(value as Framework)}
>
  <Tabs.List class="*:px-6 *:gap-3 h-8 rounded-md">
    <Tabs.Trigger value="svelte"
      ><div class={svelte}></div>
      Svelte</Tabs.Trigger
    >
    <Tabs.Trigger value="react"
      ><div class={react}></div>
      React</Tabs.Trigger
    >
  </Tabs.List>
</Tabs.Root>
