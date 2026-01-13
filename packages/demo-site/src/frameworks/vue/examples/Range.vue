<script setup lang="ts">
import { ref } from "vue";
import { range, type RangeValue } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn-vue/tabs";

const value = ref<RangeValue>([4, 6]);
const onValueChange = (newValue: RangeValue) => (value.value = newValue);
</script>

<template>
  <Tabs :ref="range({ value, onValueChange })">
    <TabsList>
      <TabsTrigger class="min-w-0" v-for="i in 11" :value="i - 1">{{
        i - 1
      }}</TabsTrigger>
    </TabsList>
  </Tabs>
</template>
