<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { rangeslider } from "slidytabs";
  let value = $state<[number, number]>([4, 6]);
  const onValueChange = (newValue: [number, number]) => (value = newValue);
</script>

<Tabs.Root {@attach rangeslider({ value, onValueChange })}>
  <Tabs.List>
    {#each { length: 11 }, i}
      <Tabs.Trigger value={i.toString()} class="min-w-0">{i}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
