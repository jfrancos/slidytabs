<script lang="ts">
  import { codeToHtml } from "shiki";
  import BasicExample from "./basicExample.svelte";
  import exampleCode from "./basicExample.svelte?raw";
</script>

<div class="flex flex-col items-center p-4">
  Svelte / shadcn-svelte

  <BasicExample />
  {#await codeToHtml( exampleCode, { lang: "svelte", theme: "github-dark" } ) then value}
    <div class="text-sm *:rounded-lg *:px-6 *:py-5">{@html value}</div>
  {/await}
</div>
