<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { slidytabs, rangetabs, slidertabs } from "slidytabs";
  import { slide } from "svelte/transition";

  let value = $state("0");
  let values: [number, number] = $state([0, 10]);
  // let values = $state(4);
</script>

<div
  class="flex w-full .max-w-sm .flex-col gap-6 justify-center items-center h-screen"
>
  <Tabs.Root>
    <Tabs.List
      {@attach rangetabs({
        value: () => values,
        setValue: (newValue) => {
          values = newValue;
        },
      })}
    >
      {#each Array.from({ length: 12 }, (_, i) => i) as i}
        <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
      {/each}
    </Tabs.List>
    {values}
  </Tabs.Root>
</div>
