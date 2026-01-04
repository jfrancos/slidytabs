<script lang="ts">
  import { slider } from "slidytabs";
  import * as Tabs from "@/shadcn/svelte/tabs";
  const triggerClasses =
    "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-gray-300 rounded-none) data-[state=inactive]:text-neutral-500";

  let value = $state(5);
  const onValueChange = (newValue: number) => (value = newValue);
</script>

<div class="flex flex-col gap-4">
  {#each { length: 2 }}
    <Tabs.Root
      value={value.toString()}
      {@attach slider({ value, onValueChange })}
    >
      <Tabs.List class="p-0 overflow-hidden">
        {#each { length: 11 }, i}
          <Tabs.Trigger class={triggerClasses} value={i.toString()}
            >{i}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    </Tabs.Root>
  {/each}
</div>
