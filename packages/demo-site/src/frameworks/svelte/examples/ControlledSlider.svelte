<script lang="ts">
  import { slider } from "slidytabs";
  import * as Tabs from "@/shadcn/svelte/tabs";
  let value = $state(5);
  const onIndexChange = (newValue: number) => (value = newValue);
</script>

<div class="flex flex-col gap-4">
  {#each { length: 2 }}
    <Tabs.Root
      value={value.toString()}
      {@attach slider({ value, onIndexChange })}
    >
      <Tabs.List>
        {#each { length: 11 }, i}
          <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>
  {/each}
</div>
