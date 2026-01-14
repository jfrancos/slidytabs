import { defineCollection } from "astro:content";
import * as content from "@base/README.md";

const readme = defineCollection({
  loader: {
    name: "readme",
    load: async ({ renderMarkdown, store }) => {
      store.clear();
      let entry;
      for (const line of content.rawContent().split("\n")) {
        if (line.startsWith("#")) {
          if (entry) {
            store.set({
              id: entry.id,
              data: {},
              rendered: await renderMarkdown(entry.text),
            });
          }
          entry = { id: line, text: "" };
        }
        if (!entry) {
          throw new Error("Issue with README.md");
        }
        entry.text += line + "\n";
      }
    },
  },
});

export const collections = { readme };
