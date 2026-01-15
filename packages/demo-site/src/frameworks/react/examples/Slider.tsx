import { useState } from "react";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";
import { sharps, flats } from "@/lib/scales";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-zinc-300 rounded-none) data-[state=inactive]:text-zinc-500";

export default () => {
  const [value, onValueChange] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      {[flats, sharps].map((scale, i) => (
        <Tabs key={i} defaultValue={"0"} ref={slider({ value, onValueChange })}>
          <TabsList className="p-0 overflow-hidden w-88">
            {scale.map((note) => (
              <TabsTrigger
                key={note}
                value={note}
                children={note}
                className={triggerClasses}
              />
            ))}
          </TabsList>
        </Tabs>
      ))}
    </div>
  );
};
