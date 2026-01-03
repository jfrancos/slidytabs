<script setup lang="ts">
import { ref } from "vue";
import { tabs } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/vue/tabs";

const options = ["Correct", "Horse", "Battery", "Stapler"];
const value = ref(0);
const onValueChange = (newValue: string | number) =>
  newValue !== 2 && (value.value = Number(newValue));
</script>

<template>
  <Tabs :ref="tabs({ value, onValueChange })" :default-value="options[0]">
    <TabsList class="[&>:nth-child(3)]:!text-red">
      <TabsTrigger v-for="item in options" :key="item" :value="item">{{
        item
      }}</TabsTrigger>
    </TabsList>
    <div class="text-center">{{ options[value] }}</div>
  </Tabs>
</template>
