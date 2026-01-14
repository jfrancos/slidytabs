import { defineCollection } from "astro:content";
import * as readmeContent from "@base/README.md";
import exampleContent from "./example-text.json";
// import {remark}
// import remarkToc from "remark-toc";

const readme = defineCollection({
  loader: {
    name: "readme",
    load: async ({ renderMarkdown, store }) => {
      store.clear();
      let entry;
      for (const line of readmeContent.rawContent().split("\n")) {
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

const examples = defineCollection({
  loader: {
    name: "examples",
    load: async ({ renderMarkdown, store }) => {
      store.clear();
      for (const [name, entry] of Object.entries(exampleContent)) {
        store.set({
          id: name,
          data: {},
          rendered: await renderMarkdown(entry),
        });
      }
    },
  },
});

export const collections = { readme, examples };
