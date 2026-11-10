// Node strips .ts natively but not JSX. Reuse installed TypeScript for test-only TSX.
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

registerHooks({load(url, context, nextLoad) {
  if (url.startsWith('file:') && url.endsWith('.tsx')) {
    const {outputText} = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
      compilerOptions: {jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
      fileName: new URL(url).pathname,
    });
    return {format: 'module', source: outputText, shortCircuit: true};
  }
  return nextLoad(url, context);
}});
