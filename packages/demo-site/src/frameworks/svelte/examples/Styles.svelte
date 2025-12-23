<script lang="ts">
  import { tabs } from "slidytabs";
  import * as Tabs from "@/shadcn/svelte/tabs";
  const activeRedBG = "data-[state=active]:bg-red";
</script>

<Tabs.Root {@attach tabs()} value="account" class="text-center">
  <Tabs.List class="bg-blue">
    <Tabs.Trigger value="account" class={activeRedBG}>Account</Tabs.Trigger>
    <Tabs.Trigger value="password" class={activeRedBG}>Password</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
