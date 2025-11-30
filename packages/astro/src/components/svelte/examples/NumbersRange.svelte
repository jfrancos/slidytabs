<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { slidytabs } from "slidytabs";
</script>

<Tabs.Root {@attach slidytabs({ value: [2, 4] })}>
  <Tabs.List class="*:min-w-0">
    {#each { length: 11 }, i}
      <Tabs.Trigger value={String(i)}>{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
