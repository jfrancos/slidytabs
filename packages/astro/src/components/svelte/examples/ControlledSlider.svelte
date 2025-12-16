<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { slider } from "slidytabs";
  let value = $state(5);
  const onValueChange = (newValue: number) => (value = newValue);
</script>

<div class="flex flex-col gap-4">
  {#each { length: 2 }}
    <Tabs.Root
      value={value.toString()}
      {@attach slider({ value, onValueChange })}
    >
      <Tabs.List>
        {#each { length: 11 }, i}
          <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>
  {/each}
</div>
