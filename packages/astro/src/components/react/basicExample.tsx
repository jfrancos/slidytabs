import { Tabs, TabsList, TabsTrigger } from "./tabs.js";
// import { rangetabs } from "slidytabs";

export const TabsDemo = () => (
  <Tabs defaultValue="account" ref={() => {}}>
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  </Tabs>
);
