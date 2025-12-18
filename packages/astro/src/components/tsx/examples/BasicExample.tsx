import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/tabs";
import { tabs } from "slidytabs";

export default () => (
  <Tabs defaultValue="password" ref={tabs()}>
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">Account</TabsContent>
    <TabsContent value="password">Password</TabsContent>
  </Tabs>
);
