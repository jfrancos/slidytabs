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

<div class="even:*:col-span-2 grid grid-cols-3 gap-x-8 gap-y-4 items-center">
  <div>Choose sticky:</div>
  {@render Slider({ value: sticky, onValueChange })}
  <div>Sticky applied:</div>
  {@render Slider({ sticky })}
</div>
