import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs"; // should be
import { slidytabs } from "slidytabs";

export default () => (
  <Tabs defaultValue="account">
    <TabsList ref={slidytabs}>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  </Tabs>
);
