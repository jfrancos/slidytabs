import { useState } from "react";
import { slider, type SliderOptions } from "slidytabs";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";

const Slider = (sliderOptions: SliderOptions) => (
  <Tabs defaultValue={"5"} ref={slider(sliderOptions)}>
    <TabsList>
      {Array.from({ length: 11 }, (_, i) => (
        <TabsTrigger className="min-w-0" key={i} value={i.toString()}>
          {i}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default () => {
  const [sticky, setSticky] = useState(5);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1.5">
        Choose sticky:
        <Slider value={sticky} onValueChange={setSticky} />
      </div>
      <div className="flex flex-col gap-1.5">
        Sticky applied:
        <Slider sticky={sticky} />
      </div>
    </div>
  );
};
