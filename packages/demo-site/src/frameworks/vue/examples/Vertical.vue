<script setup lang="ts">
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/vue/tabs";
</script>

<template>
  <Tabs :ref="slider()" default-value="account" orientation="vertical">
    <TabsList class="h-full flex-col items-stretch">
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  </Tabs>
</template>
