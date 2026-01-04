import { useState } from "react";
import { tabs } from "slidytabs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shadcn/tabs";

export default () => {
  const [value, setValue] = useState("correct");
  const updateValue = (newValue: string) =>
    newValue !== "battery" && setValue(newValue);

  return (
    <Tabs value={value} onValueChange={updateValue} ref={tabs()}>
      <TabsList className="[&>:nth-child(3)]:!text-red">
        <TabsTrigger value="correct">Correct</TabsTrigger>
        <TabsTrigger value="horse">Horse</TabsTrigger>
        <TabsTrigger value="battery">Battery</TabsTrigger>
        <TabsTrigger value="staple">Staple</TabsTrigger>
      </TabsList>
      <TabsContent className="text-center" value="correct" children="Correct" />
      <TabsContent className="text-center" value="horse" children="Horse" />
      <TabsContent className="text-center" value="battery" children="Battery" />
      <TabsContent className="text-center" value="staple" children="Staple" />
    </Tabs>
  );
};
