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
  <!-- Svelte / shadcn-svelte -->

  <div class="flex flex-col items-center border-gray-100 border-4 rounded-lg">
    <div class="p-8">
      <BasicExample />
    </div>
    {#await codeToHtml( exampleCode, { lang: "svelte", theme: "github-light", decorations: [decoration] } ) then value}
      <div class="text-sm *:px-6 *:py-5 *:!bg-neutral-100">
        {@html value}
      </div>
    {/await}
  </div>
</div>
