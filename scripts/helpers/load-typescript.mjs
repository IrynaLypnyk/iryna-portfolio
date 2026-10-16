import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);

/** Isolated component/handler tests with explicit mocks for external effects. */
export function loadTypeScript(file, mocks = {}, cache = new Map()) {
  const candidate = path.resolve(root, file);
  const resolved = ['', '.ts', '.tsx', '.json']
    .map((extension) => candidate + extension)
    .find(existsSync);
  if (!resolved) throw new Error(`Test module not found: ${file}`);
  if (resolved.endsWith('.json')) return require(resolved);
  if (cache.has(resolved)) return cache.get(resolved);
  const exports = {};
  cache.set(resolved, exports);
  const source = ts.transpileModule(readFileSync(resolved, 'utf8'), {
    fileName: resolved,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(
    source,
    {
      exports,
      Error,
      console,
      process,
      Set,
      Map,
      URL,
      require: (name) => {
        if (name in mocks) return mocks[name];
        if (name.startsWith('@/')) return loadTypeScript(`src/${name.slice(2)}`, mocks, cache);
        if (name.startsWith('.'))
          return loadTypeScript(path.join(path.dirname(resolved), name), mocks, cache);
        return require(name);
      },
    },
    { filename: resolved }
  );
  return exports;
}
