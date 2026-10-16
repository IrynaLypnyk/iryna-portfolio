// Native ESM test loader: run the actual TypeScript service and generated Prisma
// client without bundling, changing generated files, or adding a runtime dependency.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  let candidate;
  if (specifier.startsWith('@/')) candidate = sourceRoot + specifier.slice(2);
  else if (
    specifier.startsWith('.') &&
    context.parentURL?.startsWith(pathToFileURL(sourceRoot).href)
  ) {
    candidate = fileURLToPath(new URL(specifier, context.parentURL));
  }
  if (candidate) {
    for (const extension of ['', '.ts', '.tsx']) {
      if (existsSync(candidate + extension) && /\.tsx?$/.test(candidate + extension)) {
        return { url: pathToFileURL(candidate + extension).href, shortCircuit: true };
      }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith(pathToFileURL(sourceRoot).href) && /\.tsx?$/.test(url)) {
    return {
      format: 'module',
      shortCircuit: true,
      source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        fileName: fileURLToPath(url),
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText,
    };
  }
  return nextLoad(url, context);
}
