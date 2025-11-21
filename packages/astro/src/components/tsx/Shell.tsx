import { useState, useEffect } from "react";

export default function ({ filename }: { filename: string }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    (async () => {
      const { default: component } = await import(`./examples/${filename}.tsx`);
      setComponent(component);
    })();
  }, []);

  return Component;
}
