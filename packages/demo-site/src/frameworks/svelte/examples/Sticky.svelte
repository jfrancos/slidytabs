<script lang="ts">
  import { slider, type SliderOptions } from "slidytabs";
  import * as Tabs from "@/shadcn-svelte/tabs";

  let sticky = $state(5);
  const onValueChange = (next: number) => (sticky = next);
</script>

{#snippet Slider(sliderOptions: SliderOptions)}
  <Tabs.Root value={sticky.toString()} {@attach slider(sliderOptions)}>
    <Tabs.List>
      {#each { length: 11 }, i}
        <Tabs.Trigger class="min-w-0" value={i.toString()}>{i}</Tabs.Trigger>
      {/each}
    </Tabs.List>
  </Tabs.Root>
{/snippet}

<div class="flex flex-col gap-3 text-sm">
  <div class="flex flex-col gap-1.5">
    Choose sticky:
    {@render Slider({ value: sticky, onValueChange })}
  </div>
  <div class="flex flex-col gap-1.5">
    Sticky applied:
    {@render Slider({ sticky })}
  </div>
</div>
