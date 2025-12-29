import { useState } from "react";
import { tabs } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/react/tabs";
const options = ["Correct", "Horse", "Battery", "Stapler"];

export default () => {
  const [index, setIndex] = useState(0);
  const onValueChange = (newIndex: number) =>
    newIndex !== 2 && setIndex(newIndex);

  return (
    <Tabs
      defaultValue={options[index]}
      ref={tabs({ value: index, onValueChange })}
      className="text-center"
    >
      <TabsList className=" [&_:nth-child(3)]:text-red *:data-[state=inactive]:text-neutral-500">
        {options.map((value) => (
          <TabsTrigger key={value} value={value}>
            {value}
          </TabsTrigger>
        ))}
      </TabsList>
      {options[index]}
    </Tabs>
  );
};
