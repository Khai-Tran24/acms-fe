import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
// Use the project's TypeScript compiler to run TSX components and @/ imports in Node tests.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const base = specifier.startsWith("@/")
      ? pathToFileURL(root + specifier.slice(2)).href
      : specifier.startsWith(".")
        ? new URL(specifier, context.parentURL).href
        : null;
    if (base) {
      for (const suffix of ["", ".ts", ".tsx"]) {
        const url = base + suffix;
        if (/\.tsx?$/.test(url) && existsSync(fileURLToPath(url)))
          return { url, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (
      url.startsWith("file:") &&
      /\.tsx?$/.test(url) &&
      !url.includes("/node_modules/")
    ) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2023,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      };
    }
    return nextLoad(url, context);
  },
});
