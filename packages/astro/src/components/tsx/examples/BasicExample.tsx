import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/tabs";
import { slidytabs } from "slidytabs";

export default () => (
  <Tabs defaultValue="account" ref={slidytabs()} className="">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">Account</TabsContent>
    <TabsContent value="password">Password</TabsContent>
  </Tabs>
);
