import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs"; // should be
// import { rangetabs } from "slidytabs";

export default () => (
  <Tabs defaultValue="account" ref={() => {}}>
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  </Tabs>
);
