<script lang="ts">
  import { range, type RangeValue } from "slidytabs";
  import * as Tabs from "@/shadcn/svelte/tabs";

  let value: RangeValue = $state([4, 6]);
  const onValueChange = (next: RangeValue) => (value = next);
</script>

<Tabs.Root {@attach range({ value, onValueChange, push: true })}>
  <Tabs.List>
    {#each { length: 11 }, i}
      <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
