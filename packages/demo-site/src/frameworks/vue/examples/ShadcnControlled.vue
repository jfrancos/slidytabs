<script setup lang="ts">
import { ref } from "vue";
import { tabs } from "slidytabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/vue/tabs";
const value = ref("correct");
const updateValue = (newValue: string | number) =>
  newValue !== "battery" && (value.value = String(newValue));
</script>

<template>
  <Tabs :ref="tabs()" :model-value="value" @update:model-value="updateValue">
    <TabsList class="[&>:nth-child(3)]:!text-red">
      <TabsTrigger value="correct">Correct</TabsTrigger>
      <TabsTrigger value="horse">Horse</TabsTrigger>
      <TabsTrigger value="battery">Battery</TabsTrigger>
      <TabsTrigger value="staple">Staple</TabsTrigger>
    </TabsList>
    <TabsContent class="text-center" value="correct" children="Correct" />
    <TabsContent class="text-center" value="horse" children="Horse" />
    <TabsContent class="text-center" value="battery" children="Battery" />
    <TabsContent class="text-center" value="staple" children="Staple" />
  </Tabs>
</template>
