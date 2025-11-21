<script lang="ts">
  const { filename } = $props();
</script>

{#await import(`./examples/${filename}.svelte`) then { default: Demo }}
  <Demo />
{/await}
