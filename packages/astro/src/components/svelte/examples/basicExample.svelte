<script lang="ts">
  import * as Tabs from "../tabs";
  // import { rangetabs } from "slidytabs";
</script>

<Tabs.Root value="account" {@attach () => {}}>
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>
