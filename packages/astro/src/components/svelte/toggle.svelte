<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { setFramework, type Framework } from "A/lib/store.js";
  import { react, svelte } from "../icons";
  import { slidytabs } from "slidytabs";
</script>

<Tabs.Root
  {@attach slidytabs()}
  value="svelte"
  class="items-center 2xl:hidden"
  onValueChange={(value) => setFramework(value as Framework)}
>
  <Tabs.List>
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
