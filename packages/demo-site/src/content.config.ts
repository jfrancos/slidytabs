import { defineCollection } from "astro:content";
import * as readmeContent from "@base/README.md";
import exampleContent from "./example-text.json";
// import { remark } from "remark";
import { remark } from "remark";
import remarkToc from "remark-toc";

console.log(readmeContent.rawContent());

const readmeWithToc = await remark()
  .use(remarkToc, { skip: "slidytabs|Quick start|React|Svelte|Vue|Bugs" })
  .process("## Contents\n" + readmeContent.rawContent());

// console.log(toc);

const readme = defineCollection({
  loader: {
    name: "readme",
    load: async ({ renderMarkdown, store }) => {
      store.clear();
      const lines = readmeWithToc.value.split("\n");
      let entry;
      for (const [index, line] of Object.entries(lines)) {
        if (line.startsWith("#") || Number(index) === lines.length - 1) {
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
