import { useState } from "react";
import { tabs } from "../../../../../slidytabs/dist";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";
const options = ["Correct", "Horse", "Battery", "Stapler"];

export default () => {
  const [index, setIndex] = useState(0);
  const onValueChange = (newIndex: number) =>
    newIndex === 2 ? undefined : setIndex(newIndex);

  return (
    <Tabs defaultValue="Correct" ref={tabs({ value: index, onValueChange })}>
      <TabsList className="[&>:nth-child(3)]:!text-red">
        {options.map((value) => (
          <TabsTrigger key={value} value={value}>
            {value}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="text-center">{options[index]}</div>
    </Tabs>
  );
};
