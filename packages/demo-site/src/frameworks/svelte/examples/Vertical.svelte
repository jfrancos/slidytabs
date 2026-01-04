<script lang="ts">
  import { slider } from "slidytabs";
  import * as Tabs from "@/shadcn-svelte/tabs";
</script>

<Tabs.Root {@attach slider()} value="account" orientation="vertical">
  <Tabs.List class="h-full flex-col items-stretch">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
