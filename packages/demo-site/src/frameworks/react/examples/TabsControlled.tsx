import { useState } from "react";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/react/tabs";
const options = ["Correct", "Horse", "Battery", "Stapler"];

export default () => {
  const [index, setIndex] = useState(0);
  const onIndexChange = (newIndex: number) =>
    newIndex !== 2 && setIndex(newIndex);

  return (
    <Tabs
      defaultValue={options[index]}
      ref={slider({ value: index, onIndexChange })}
      className="text-center"
    >
      <TabsList>
        {options.map((value, i) => (
          <TabsTrigger
            key={value}
            value={value}
            {...(i === 2 && { className: "text-red" })}
          >
            {value}
          </TabsTrigger>
        ))}
      </TabsList>
      {options[index]}
    </Tabs>
  );
};
