import { defineCollection } from "astro:content";
import { remark } from "remark";
import remarkToc from "remark-toc";
import * as readmeContent from "@README.md";
import exampleContent from "./example-text.json";

const { value: readmeWithToc } = await remark()
  .use(remarkToc, { skip: "slidytabs|Quick start|React|Svelte|Vue|Bugs" })
  .process("## Contents\n" + readmeContent.rawContent());

const link =
  '<a href="https://ux.stackexchange.com/questions/122217/what-is-the-best-ui-component-to-make-user-select-a-number-from-small-range-1-1">';
const targetLink =
  '<a target="_blank" rel="noopener noreferrer" href="https://ux.stackexchange.com/questions/122217/what-is-the-best-ui-component-to-make-user-select-a-number-from-small-range-1-1">';

const readme = defineCollection({
  loader: {
    name: "readme",
    load: async ({ renderMarkdown, store }) => {
      store.clear();
      const lines = (readmeWithToc as string).split("\n");
      let entry;
      for (const [index, line] of Object.entries(lines)) {
        if (line.startsWith("#") || Number(index) === lines.length - 1) {
          if (entry) {
            const rendered = await renderMarkdown(entry.text);
            rendered.html = rendered.html.replace(link, targetLink);
            store.set({
              id: entry.id,
              data: {},
              rendered,
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
