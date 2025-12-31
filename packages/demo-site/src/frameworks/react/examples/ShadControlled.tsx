import { useState } from "react";
import { tabs } from "slidytabs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shadcn/react/tabs";

export default () => {
  const [value, setValue] = useState("correct");

  return (
    <Tabs
      value={value}
      onValueChange={(newValue) => newValue !== "battery" && setValue(newValue)}
      ref={tabs()}
      className="text-center"
    >
      <TabsList className="[&>:nth-child(3)]:!text-red *:data-[state=inactive]:text-neutral-500">
        <TabsTrigger value="correct">Correct</TabsTrigger>
        <TabsTrigger value="horse">Horse</TabsTrigger>
        <TabsTrigger value="battery">Battery</TabsTrigger>
        <TabsTrigger value="staple">Staple</TabsTrigger>
      </TabsList>
      <TabsContent value="correct">Correct</TabsContent>
      <TabsContent value="horse">Horse</TabsContent>
      <TabsContent value="battery">Battery</TabsContent>
      <TabsContent value="staple">Staple</TabsContent>
    </Tabs>
  );
};
