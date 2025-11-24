<script lang="ts">
  import * as Tabs from "$lib/shadcn/tabs";
  import { rangetabs } from "slidytabs";
</script>

<Tabs.Root value="account">
  <Tabs.List {@attach rangetabs()}>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
