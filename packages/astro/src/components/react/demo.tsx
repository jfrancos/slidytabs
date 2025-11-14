import { Tabs, TabsList, TabsTrigger } from "./tabs";

export default () => (
  <div className="flex items-center flex-col p-4">
    React / shadcn
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);
