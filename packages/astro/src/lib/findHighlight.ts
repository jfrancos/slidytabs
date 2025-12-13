// Is there a newer/better alternative to babel
import { parse as parseTSX } from "@babel/parser";
import { parse as parseSvelte } from "svelte/compiler";
import { walk } from "zimmerframe";
import type { JSX } from "@babel/types";

export const extractRef = (source: string) => {
  const ast = parseTSX(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  let refString;
  walk(ast.program as unknown as JSX, null, {
    JSXOpeningElement(node, { next }) {
      if (node.name.type === "JSXIdentifier" && node.name.name === "Tabs") {
        next();
      }
    },
    JSXAttribute(node, { stop }) {
      if (node.name.name === "ref") {
        refString = source.slice(node.start!, node.end!);
        stop();
      }
    },
  });
  return refString;
};

export function extractAttachment(source: string) {
  const ast = parseSvelte(source);
  let attachString;
  walk(ast.html, null, {
    InlineComponent(node, { next }) {
      if (node.name === "Tabs.Root") {
        next();
      }
    },
    AttachTag(node, { stop }) {
      attachString = source.slice(node.start, node.end);
      stop();
    },
  });
  return attachString;
}
