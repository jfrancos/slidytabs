<script lang="ts">
  let { Component: SSRComponent, filename } = $props();
</script>

{#if SSRComponent}
  <SSRComponent />
{:else}
  {#await import(`./examples/${filename}.svelte`) then { default: ClientComponent }}
    <ClientComponent />
  {/await}
{/if}
