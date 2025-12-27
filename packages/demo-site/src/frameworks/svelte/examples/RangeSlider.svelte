<script lang="ts">
  import { range, type RangeValue } from "slidytabs";
  import * as Tabs from "@/shadcn/svelte/tabs";
  let value = $state<RangeValue>([4, 6]);
  const onIndexChange = (newValue: RangeValue) => (value = newValue);
</script>

<Tabs.Root {@attach range({ value, onIndexChange })}>
  <Tabs.List>
    {#each { length: 11 }, i}
      <Tabs.Trigger value={i.toString()} class="min-w-0">{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
