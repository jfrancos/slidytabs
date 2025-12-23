<script lang="ts">
  import * as Tabs from "@shadcn-svelte/tabs";
  import { slider } from "slidytabs";
</script>

<Tabs.Root {@attach slider()} class="text-center" value="5">
  <Tabs.List>
    {#each { length: 11 }, i}
      <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#each { length: 11 }, i}
    <Tabs.Content value={i.toString()}>{i}</Tabs.Content>
  {/each}
</Tabs.Root>
