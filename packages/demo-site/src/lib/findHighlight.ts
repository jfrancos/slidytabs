// Is there a newer/better alternative to babel
import { parse as parseTSX } from "@babel/parser";
import { parse as parseSvelte } from "svelte/compiler";
import { parse as parseVue } from "vue/compiler-sfc";
import { transform, NodeTypes } from "@vue/compiler-dom";
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

export const extractAttachment = (source: string) => {
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
};

export const extractVueRef = (source: string) => {
  const ast = parseVue(source).descriptor.template?.ast;
  if (!ast) {
    return;
  }
  let attachString;
  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (node.type === NodeTypes.ELEMENT && node.tag === "Tabs") {
          const prop = node.props.find(({ name }) => name === "bind");
          attachString = prop?.loc.source;
        }
      },
    ],
  });
  return attachString;
};
