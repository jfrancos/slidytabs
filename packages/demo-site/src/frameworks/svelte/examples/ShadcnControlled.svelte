<script lang="ts">
  import { tabs } from "slidytabs";
  import { Tabs, List, Trigger, Content } from "@/shadcn-svelte/tabs";
  let value = $state("correct");
</script>

<Tabs
  {@attach tabs()}
  bind:value={() => value, (next) => next !== "battery" && (value = next)}
>
  <List class="[&>:nth-child(3)]:!text-red">
    <Trigger value="correct">Correct</Trigger>
    <Trigger value="horse">Horse</Trigger>
    <Trigger value="battery">Battery</Trigger>
    <Trigger value="staple">Staple</Trigger>
  </List>
  <Content class="text-center" value="correct">Correct</Content>
  <Content class="text-center" value="horse">Horse</Content>
  <Content class="text-center" value="battery">Battery</Content>
  <Content class="text-center" value="staple">Staple</Content>
</Tabs>
