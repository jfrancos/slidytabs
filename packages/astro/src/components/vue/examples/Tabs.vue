<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcn/tabs";
</script>

<template>
  <Tabs default-value="account" class="text-center">
    <TabsList>
      <TabsTrigger value="account"> Account </TabsTrigger>
      <TabsTrigger value="password"> Password </TabsTrigger>
    </TabsList>
    <TabsContent value="account">Account</TabsContent>
    <TabsContent value="password">Password</TabsContent>
  </Tabs>
</template>
