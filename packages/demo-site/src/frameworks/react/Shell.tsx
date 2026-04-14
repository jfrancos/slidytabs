import { lazy, Suspense } from "react";

export default function ({ filename }: { filename: string }) {
  const Component = lazy(() => import(`./examples/${filename}.tsx`));
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
