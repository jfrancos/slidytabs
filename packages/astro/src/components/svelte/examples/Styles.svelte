<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { slidytabs } from "slidytabs";
</script>

<Tabs.Root {@attach slidytabs()} value="account" class="text-center">
  <Tabs.List class="bg-blue *:data-[state=active]:bg-red">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
