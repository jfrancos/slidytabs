<script setup lang="ts">
import { tabs } from "slidytabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/vue/tabs";
</script>

<template>
  <Tabs :ref="tabs()" default-value="account" class="text-center">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">Account</TabsContent>
    <TabsContent value="password">Password</TabsContent>
  </Tabs>
</template>
