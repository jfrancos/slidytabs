import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";
import { slidytabs } from "slidytabs";

export default () => (
  <Tabs defaultValue="account" ref={slidytabs({ value: [2, 10] })}>
    <TabsList>
      {Array.from({ length: 12 }, (_, i) => (
        <TabsTrigger key={i} value={String(i)}>
          {i}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);
