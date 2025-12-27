import { useState } from "react";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/react/tabs";
const options = ["Correct", "Horse", "Battery", "Stapler"];

export default () => {
  const [index, setIndex] = useState(0);

  return (
    <Tabs
      defaultValue={options[index]}
      ref={slider({
        value: index,
        onIndexChange: (newIndex) => newIndex !== 2 && setIndex(newIndex),
      })}
      className="text-center"
    >
      <TabsList>
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
