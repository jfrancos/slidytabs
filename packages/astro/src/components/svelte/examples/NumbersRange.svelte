<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { rangetabs, type RangeValue } from "slidytabs";

  let value: RangeValue = $state([2, 4]);
  const onValueChange = (newValue: RangeValue) => (value = newValue);
</script>

<Tabs.Root {@attach rangetabs({ value, onValueChange })}>
  <Tabs.List>
    {#each { length: 11 }, i}
      <Tabs.Trigger value={String(i)} class="min-w-0">{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
