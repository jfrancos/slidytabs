import { useState, useEffect } from "react";

export default function ({ filename }: { filename: string }) {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    (async () => {
      setComponent((await import(`./examples/${filename}.tsx`)).default);
    })();
  }, []);
  return Component;
}
