<script lang="ts">
  import * as Tabs from "@/shadcn/svelte/tabs";
  import { tabs } from "slidytabs";
</script>

<Tabs.Root {@attach tabs()} value="account" orientation="vertical">
  <Tabs.List class="h-full flex-col items-stretch">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
