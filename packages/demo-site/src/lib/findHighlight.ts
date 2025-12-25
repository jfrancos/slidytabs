import { parse as parseTSX } from "@babel/parser";
import { parse as parseSvelte } from "svelte/compiler";
import { parse as parseVue } from "vue/compiler-sfc";
import { parse as parseAstro } from "@astrojs/compiler";
import { is } from "@astrojs/compiler/utils";
import { transform, NodeTypes } from "@vue/compiler-dom";
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
  walk(ast, null, {
    _(node, { next }) {
      if (is.tag(node) && node.name === "Tabs") {
        const attr = node.attributes.find(({ name }) =>
          name.startsWith("data-slidytabs-")
        );
        const dataString = attr?.name;
        locations = [
          {
            start: attr.position.start.offset,
            end: attr.position.start.offset + dataString.length,
          },
        ];
      }
      if (is.tag(node) && node.name === "script") {
        const script = node.children[0].value;
        const ast = parseTSX(script, {
          sourceType: "module",
          plugins: ["typescript"],
        });
        walk(ast, null, {
          _(node, { next }) {
            if (node.type === "ExpressionStatement") {
              const expression = script.slice(node.start, node.end);
              const location = {
                start: source.indexOf(expression),
                end: source.indexOf(expression) + expression.length,
              };
              console.log(location);
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
