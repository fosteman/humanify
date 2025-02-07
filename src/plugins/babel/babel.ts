import { PluginItem } from "@babel/core";
import * as t from "@babel/types";
import { transformWithPlugins } from "../../babel-utils.js";
import bautifier from "babel-plugin-transform-beautifier";

const convertVoidToUndefined: PluginItem = {
  visitor: {
    // Convert void 0 to undefined
    UnaryExpression(path) {
      if (
        path.node.operator === "void" &&
        path.node.argument.type === "NumericLiteral"
      ) {
        path.replaceWith({
          type: "Identifier",
          name: "undefined"
        });
      }
    }
  }
};

const syntaxErrorPlugin: PluginItem = {
  visitor: {
    Program(path) {
      // Example: this would log an error and allow Babel to continue parsing
      console.error("Syntax error encountered. skipping", path);
      path.skip();
    }
  }
};

const flipComparisonsTheRightWayAround: PluginItem = {
  visitor: {
    BinaryExpression(path) {
      const node = path.node;
      const mappings: any = {
        "==": "==",
        "!=": "!=",
        "===": "===",
        "!==": "!==",
        "<": ">",
        "<=": ">=",
        ">": "<",
        ">=": "<="
      };
      if (
        t.isLiteral(node.left) &&
        !t.isLiteral(node.right) &&
        mappings[node.operator]
      ) {
        path.replaceWith({
          ...node,
          left: node.right,
          right: node.left,
          operator: mappings[node.operator]
        });
      }
    }
  }
};

const makeNumbersLonger: PluginItem = {
  visitor: {
    NumericLiteral(path) {
      if (
        typeof path.node.extra?.raw === "string" &&
        path.node.extra?.raw?.includes("e")
      ) {
        path.replaceWith({
          type: "NumericLiteral",
          value: Number(path.node.extra.raw)
        });
      }
    }
  }
};

export default async (code: string): Promise<string> =>
  transformWithPlugins(code, [
    convertVoidToUndefined,
    flipComparisonsTheRightWayAround,
    makeNumbersLonger,
    bautifier,
    syntaxErrorPlugin
  ]);
