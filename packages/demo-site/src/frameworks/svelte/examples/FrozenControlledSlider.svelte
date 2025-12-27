<script lang="ts">
  import { slider } from "slidytabs";
  import * as Tabs from "@/shadcn/svelte/tabs";
  const bound = [() => "5", () => {}];
  let value = $state("5");
</script>

<Tabs.Root {@attach slider({ value: 5 })} class="text-center">
  <Tabs.List>
    {#each { length: 11 }, i}
      <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#each { length: 11 }, i}
    <Tabs.Content value={i.toString()}>{i}</Tabs.Content>
  {/each}
</Tabs.Root>
