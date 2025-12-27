import { slider } from "slidytabs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shadcn/react/tabs";

export default () => {
  console.log("hie");
  return (
    <Tabs
      onValueChange={(value) => console.log(value)}
      defaultValue="account"
      // value="account"
      ref={slider()}
      // ref={slider({ value: 0 })}
      className="text-center"
    >
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account</TabsContent>
      <TabsContent value="password">Password</TabsContent>
    </Tabs>
  );
};
