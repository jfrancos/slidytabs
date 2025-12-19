<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const props = defineProps<{ filename: string }>();
const Component = defineAsyncComponent(
  () => import(`./examples/${props.filename}.vue`)
);
</script>

<template>
  <Component />
</template>
