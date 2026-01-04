<script setup lang="tsx">
import { ref } from "vue";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn-vue/tabs";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:bg-gray-300 data-[state=active]:rounded-none data-[state=inactive]:text-neutral-500";

const Slider = ({
  value,
  handleValue: onValueChange,
  sticky,
}: {
  value?: number;
  handleValue?: (value: number) => void;
  sticky?: number;
}) => (
  <Tabs defaultValue={"5"} ref={slider({ value, onValueChange, sticky })}>
    <TabsList class="p-0 overflow-hidden">
      {Array.from({ length: 11 }, (_, i) => (
        <TabsTrigger key={i} value={i.toString()} class={triggerClasses}>
          {i}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

const sticky = ref(5);
</script>

<template>
  <div class="grid grid-cols-3 gap-y-4 gap-x-8 items-center">
    <div>Choose sticky:</div>
    <Slider :value="sticky" :onValueChange="(v: number) => (sticky = v)" />
    <div>Sticky applied:</div>
    <Slider :sticky="sticky" />
  </div>
</template>
