import { useState } from "react";
import { rangetabs, type RangeValue } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";

export default () => {
  const [value, onValueChange] = useState<RangeValue>([4, 6]);
  return (
    <Tabs defaultValue="account" ref={rangetabs({ value, onValueChange })}>
      <TabsList>
        {Array.from({ length: 12 }, (_, i) => (
          <TabsTrigger
            key={i}
            value={String(i)}
            children={i}
            className="min-w-0 px-2"
          />
        ))}
      </TabsList>
    </Tabs>
  );
};
