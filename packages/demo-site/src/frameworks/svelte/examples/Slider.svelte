<script lang="ts">
  import { slider } from "slidytabs";
  import * as Tabs from "@/shadcn-svelte/tabs";
  import { sharps, flats } from "@/lib/scales";
  const triggerClasses =
    "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-zinc-300 rounded-none) data-[state=inactive]:text-zinc-500";

  let value = $state(0);
  const onValueChange = (newValue: number) => (value = newValue);
</script>

<div class="flex flex-col gap-4">
  {#each [flats, sharps] as scale}
    <Tabs.Root
      value={value.toString()}
      {@attach slider({ value, onValueChange })}
    >
      <Tabs.List class="p-0 overflow-hidden w-88">
        {#each scale as note}
          <Tabs.Trigger class={triggerClasses} value={note}>{note}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    </Tabs.Root>
  {/each}
</div>
