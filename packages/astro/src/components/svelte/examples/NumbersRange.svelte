<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { slidytabs } from "slidytabs";
</script>

<Tabs.Root {@attach slidytabs({ value: 5 })}>
  <Tabs.List>
    {#each { length: 12 }, i}
      <Tabs.Trigger value={String(i)}>{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>

<!-- <Tabs.Root value="account">
  <Tabs.List {@attach rangetabs()}>
    {#each { length: 12 }, i}
      <Tabs.Trigger value={String(i)}>{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root> -->
