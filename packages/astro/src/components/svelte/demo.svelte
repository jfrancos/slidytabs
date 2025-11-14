<script lang="ts">
  import * as Tabs from "./tabs/index.js";
</script>

<div class="flex flex-col items-center p-4">
  Svelte / shadcn-svelte

  <Tabs.Root value="account">
    <Tabs.List>
      <Tabs.Trigger value="account">Account</Tabs.Trigger>
      <Tabs.Trigger value="password">Password</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>
</div>
