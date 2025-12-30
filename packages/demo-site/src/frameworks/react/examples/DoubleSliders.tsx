import { useState } from "react";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/react/tabs";

export default () => {
  const [value, onValueChange] = useState(5);
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }, (_, n) => (
        <Tabs key={n} defaultValue={"5"} ref={slider({ value, onValueChange })}>
          <TabsList className="*:data-[state=inactive]:text-neutral-500">
            {Array.from({ length: 11 }, (_, i) => (
              <TabsTrigger key={i} value={i.toString()} children={i} />
            ))}
          </TabsList>
        </Tabs>
      ))}
    </div>
  );
};
