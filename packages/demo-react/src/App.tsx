import { useState } from "react";
import { rangetabs } from "slidytabs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="account">
        <TabsList ref={rangetabs()}>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">1</TabsContent>
        <TabsContent value="password">2</TabsContent>
      </Tabs>
    </div>
  );
}

// function App() {
//   return <div className="size-4 bg-green" />;
// }

export default App;
