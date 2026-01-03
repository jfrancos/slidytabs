<script setup lang="ts">
import { ref } from "vue";
import { range, type RangeValue } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/vue/tabs";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-gray-300 rounded-none) data-[state=inactive]:text-neutral-500";

const value = ref<RangeValue>([4, 6]);
const onValueChange = (newValue: RangeValue) => (value.value = newValue);
</script>

<template>
  <div class="flex flex-col gap-4">
    <Tabs
      :ref="range({ value, onValueChange })"
      default-value="5"
      class="text-center"
    >
      <TabsList class="p-0 overflow-hidden">
        <TabsTrigger :class="triggerClasses" v-for="i in 11" :value="i - 1">{{
          i - 1
        }}</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>
