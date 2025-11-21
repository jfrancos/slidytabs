{
  /* <script lang="ts">
  const { filename } = $props();
</script> */
}

const Shell = async ({ filename }) => {
  await import(`./examples/${filename}.tsx`);
};

// {#await import(`./examples/${filename}.tsx`) then { default: Demo }}
//   <Demo />
// {/await}
