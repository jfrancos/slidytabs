<script setup lang="ts">
import { ref } from "vue";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn-vue/tabs";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-gray-300 rounded-none) data-[state=inactive]:text-neutral-500";

const value = ref(0);
const onValueChange = (newValue: number) => (value.value = Number(newValue));
</script>

<template>
  <div class="flex flex-col gap-4">
    <Tabs
      :ref="slider({ value, onValueChange })"
      default-value="5"
      class="text-center"
      v-for=" in 2"
    >
      <TabsList class="p-0 overflow-hidden">
        <TabsTrigger :class="triggerClasses" v-for="i in 11" :value="i - 1">{{
          i - 1
        }}</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>
