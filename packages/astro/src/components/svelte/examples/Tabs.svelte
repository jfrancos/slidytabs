<script lang="ts">
  import * as Tabs from "@shadcn-svelte/tabs";
  import { tabs } from "slidytabs";
</script>

<Tabs.Root {@attach tabs()} value="account" class="text-center">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">Account</Tabs.Content>
  <Tabs.Content value="password">Password</Tabs.Content>
</Tabs.Root>
