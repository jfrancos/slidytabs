<script lang="ts">
  import * as Tabs from "./tabs/index.js";
  import { setFramework, type Framework } from "$lib/store.js";
</script>

<Tabs.Root
  value="svelte"
  class="items-center sm:hidden"
  onValueChange={(value) => setFramework(value as Framework)}
>
  <Tabs.List>
    <Tabs.Trigger value="svelte">Svelte</Tabs.Trigger>
    <Tabs.Trigger value="react">React</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
