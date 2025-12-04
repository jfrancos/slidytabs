<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { slidytabs } from "slidytabs";
  let value = $state(5);
  const onValueChange = (newValue: number) => (value = newValue);
</script>

<div class="flex flex-col gap-4">
  {#each { length: 2 }}
    <Tabs.Root {@attach slidytabs({ value, onValueChange })}>
      <Tabs.List class="*:min-w-0">
        {#each { length: 11 }, i}
          <Tabs.Trigger value={String(i)}>{i}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>
  {/each}
</div>
