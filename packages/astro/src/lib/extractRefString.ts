import { parse } from "@babel/parser";
import { createRequire } from "module";
import type { NodePath } from "@babel/traverse";
import type { JSXOpeningElement } from "@babel/types";
const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;

export function extractRefString(source: string) {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  let refString;

  traverse(ast, {
    JSXOpeningElement({ node }: NodePath<JSXOpeningElement>) {
      if (node.name.type !== "JSXIdentifier" || node.name.name !== "Tabs") {
        return;
      }
      const attr = node.attributes.find(
        (attr) => attr.type === "JSXAttribute" && attr.name.name === "ref"
      );
      if (!attr) {
        return;
      }
      refString = source.slice(attr.start!, attr.end!);
    },
  });
  return refString;
}
