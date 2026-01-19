<script setup lang="tsx">
import { ref } from "vue";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn-vue/tabs";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:bg-zinc-300 data-[state=active]:rounded-none data-[state=inactive]:text-zinc-500";

const Slider = ({
  value,
  onValueChange,
  sticky,
}: {
  value?: number;
  onValueChange?: (value: number) => void;
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
  <div class="flex flex-col gap-3 text-sm">
    <div class="flex flex-col gap-1.5">
      Choose sticky:
      <Slider :value="sticky" :onValueChange="(v: number) => (sticky = v)" />
    </div>
    <div class="flex flex-col gap-1.5">
      Sticky applied: <Slider :sticky="sticky" />
    </div>
  </div>
</template>
