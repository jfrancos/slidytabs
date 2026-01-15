<script setup lang="ts">
import { ref } from "vue";
import { tabs } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn-vue/tabs";

const options = ["Correct", "Horse", "Battery", "Stapler"];
const index = ref(0);
const onValueChange = (next: number) =>
  next === 2 ? undefined : (index.value = next);
</script>

<template>
  <Tabs :ref="tabs({ value: index, onValueChange })" default-value="Correct">
    <TabsList class="[&>:nth-child(3)]:!text-red">
      <TabsTrigger v-for="item in options" :value="item" :key="item">{{
        item
      }}</TabsTrigger>
    </TabsList>
    <div class="text-center">{{ options[index] }}</div>
  </Tabs>
</template>
