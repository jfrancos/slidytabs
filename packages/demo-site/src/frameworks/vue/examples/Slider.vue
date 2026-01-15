<script setup lang="ts">
import { ref } from "vue";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn-vue/tabs";
import { sharps, flats } from "@/lib/scales";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-zinc-300 rounded-none) data-[state=inactive]:text-zinc-500";

const value = ref(0);
const onValueChange = (newValue: number) => (value.value = Number(newValue));
</script>

<template>
  <div class="flex flex-col gap-4">
    <Tabs
      :ref="slider({ value, onValueChange })"
      :default-value="scale[value]"
      v-for="scale in [flats, sharps]"
    >
      <TabsList class="p-0 overflow-hidden w-88">
        <TabsTrigger
          :class="triggerClasses"
          v-for="note in scale"
          :value="note"
          >{{ note }}</TabsTrigger
        >
      </TabsList>
    </Tabs>
  </div>
</template>
