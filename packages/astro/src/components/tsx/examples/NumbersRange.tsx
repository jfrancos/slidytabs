import { useState } from "react";
import { rangeslider, type RangeValue } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";

export default () => {
  const [value, onValueChange] = useState<RangeValue>([4, 6]);
  return (
    <Tabs ref={rangeslider({ value, onValueChange })}>
      <TabsList>
        {Array.from({ length: 12 }, (_, i) => (
          <TabsTrigger key={i} value={String(i)} className="min-w-0 px-2">
            {i}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
