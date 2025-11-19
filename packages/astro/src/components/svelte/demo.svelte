<script lang="ts">
  import { codeToHtml } from "shiki";
  import BasicExample from "./basicExample.svelte";
  import exampleCode from "./basicExample.svelte?raw";

  const highlight = "{@attach () => {}}";
  const start = exampleCode.indexOf(highlight);
  const end = start + highlight.length;
  const properties = { class: "highlighted" };
  const decoration = { start, end, properties };
</script>

<div class="flex flex-col items-center p-4">
  Svelte / shadcn-svelte

  <BasicExample />
  {#await codeToHtml( exampleCode, { lang: "svelte", theme: "github-dark", decorations: [decoration] } ) then value}
    <div class="text-sm *:rounded-lg *:px-6 *:py-5">{@html value}</div>
  {/await}
</div>
