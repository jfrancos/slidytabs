import { parse as parseTSX } from "@babel/parser";
import { parse as parseSvelte } from "svelte/compiler";
import { parse as parseVue } from "vue/compiler-sfc";
import { parse as parseAstro } from "@astrojs/compiler";
import { transform, NodeTypes } from "@vue/compiler-dom";
import { is } from "@astrojs/compiler/utils";
import type { Node } from "@astrojs/compiler/types";
import { walk } from "zimmerframe";
import type { JSX } from "@babel/types";

export const extractTsx = (source: string) => {
  const ast = parseTSX(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  let locations;
  walk(ast.program as unknown as JSX, null, {
    JSXOpeningElement(node, { next }) {
      if (node.name.type === "JSXIdentifier" && node.name.name === "Tabs") {
        next();
      }
    },
    JSXAttribute(node, { stop }) {
      if (node.name.name === "ref") {
        locations = [node];
        stop();
      }
    },
  });
  return locations;
};

export const extractSvelte = (source: string) => {
  const ast = parseSvelte(source);
  let locations;
  walk(ast.html, null, {
    InlineComponent(node, { next }) {
      if (node.name === "Tabs.Root") {
        next();
      }
    },
    AttachTag(node, { stop }) {
      locations = [node];
      stop();
    },
  });
  return locations;
};

export const extractVue = (source: string) => {
  const ast = parseVue(source).descriptor.template?.ast;
  if (!ast) {
    return;
  }
  let locations;
  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (node.type === NodeTypes.ELEMENT && node.tag === "Tabs") {
          const prop = node.props.find(({ name }) => name === "bind");
          locations = [
            { start: prop?.loc.start.offset, end: prop?.loc.end.offset },
          ];
        }
      },
    ],
  });
  return locations;
};

export const extractAstro = async (source: string) => {
  const { ast } = await parseAstro(source);
  let locations;
  walk(ast as Node, null, {
    _(node, { next }) {
      if (is.tag(node) && node.name === "Tabs") {
        const attr = node.attributes.find(({ name }) =>
          name.startsWith("data-slidytabs-")
        );
        const name = attr?.name;
        const start = attr?.position?.start;
        if (name == null || start == null) {
          return;
        }
        locations = [
          {
            start: start.offset,
            end: start.offset + name.length,
          },
        ];
      }
      if (is.tag(node) && node.name === "script" && is.text(node.children[0])) {
        const script = node.children[0].value;
        const ast = parseTSX(script, {
          sourceType: "module",
          plugins: ["typescript"],
        });
        walk(ast, null, {
          _(node, { next }) {
            if ((node.type as unknown) === "ExpressionStatement") {
              const { start, end } = node;
              if (!start || !end) {
                return;
              }
              const expression = script.slice(start, end);
              const location = {
                start: source.indexOf(expression),
                end: source.indexOf(expression) + expression.length,
              };
              locations.push(location);
            }
            next();
          },
        });
      }
      next();
    },
  });
  return locations;
};
