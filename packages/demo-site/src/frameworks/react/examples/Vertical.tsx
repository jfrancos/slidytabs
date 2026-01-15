import { slider } from "../../../../../slidytabs/dist";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/tabs";

export default () => (
  <Tabs ref={slider()} defaultValue="account" orientation="vertical">
    <TabsList className="h-full flex-col items-stretch">
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  </Tabs>
);
