import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shadcn/react/tabs";
import { tabs } from "slidytabs";

export default () => (
  <Tabs defaultValue="password" ref={tabs()} className="text-center">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">Account</TabsContent>
    <TabsContent value="password">Password</TabsContent>
  </Tabs>
);
