import { useState } from "react";
import { type RangeValue, range } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";

export default () => {
  const [value, onValueChange] = useState<RangeValue>([4, 6]);
  return (
    <Tabs ref={range({ value, onValueChange })}>
      <TabsList>
        {Array.from({ length: 11 }, (_, i) => i.toString()).map((i) => (
          <TabsTrigger key={i} value={i} className="min-w-0">
            {i}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
