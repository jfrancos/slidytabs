import { useState } from "react";
import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/react/tabs";
const triggerClasses =
  "min-w-0 ring-inset rounded-lg h-full !shadow-none data-[state=active]:(bg-gray-300 rounded-none) data-[state=inactive]:text-neutral-500";

const Slider = ({
  value,
  handleValue: onValueChange,
  sticky,
}: {
  value?: number;
  handleValue?: (value: number) => void;
  sticky?: number;
}) => (
  <Tabs defaultValue={"5"} ref={slider({ value, onValueChange, sticky })}>
    <TabsList className="p-0 overflow-hidden">
      {Array.from({ length: 11 }, (_, i) => (
        <TabsTrigger key={i} value={i.toString()} className={triggerClasses}>
          {i}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default () => {
  const [sticky, setSticky] = useState(5);

  return (
    <div className="grid grid-cols-[auto_1fr] gap-y-4 gap-x-8 items-center">
      <div>Choose sticky:</div>
      <Slider value={sticky} handleValue={setSticky} />
      <div>Sticky applied:</div>
      <Slider sticky={sticky} />
    </div>
  );
};
