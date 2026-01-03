<script lang="ts">
  import { tabs } from "slidytabs";
  import { Tabs, List, Trigger } from "@/shadcn/svelte/tabs";
  const options = ["Correct", "Horse", "Battery", "Stapler"];

  let index = $state(0);
  const onValueChange = (next: number) => next !== 2 && (index = next);
</script>

<Tabs {@attach tabs({ value: index, onValueChange })} value="correct">
  <List class="[&>:nth-child(3)]:!text-red">
    {#each options as value}
      <Trigger {value}>{value}</Trigger>
    {/each}
  </List>
  {options[index]}
</Tabs>
