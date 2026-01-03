import { useState } from "react";
import { range, type RangeValue } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/react/tabs";

export default () => {
  const [value, onValueChange] = useState<RangeValue>([4, 6]);
  return (
    <Tabs ref={range({ value, onValueChange, push: true })}>
      <TabsList>
        {Array.from({ length: 12 }, (_, i) => (
          <TabsTrigger
            key={i}
            value={String(i)}
            className="min-w-0 px-2 data-[state=inactive]:text-neutral-500"
          >
            {i}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
