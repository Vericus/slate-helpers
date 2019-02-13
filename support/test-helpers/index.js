/*
 * This is a copy of slate-dev-test-utils
 * for some reason tests won't run using the published
 * slate-dev-test-utils but it does run with this
 */

import fs from "fs";
import { basename, extname, resolve } from "path";
import { KeyUtils, Editor } from "slate";
import expect from "expect";

export const testWithHistory = (input, output, editor, opts, fn, ...args) => {
  editor.setValue(output);
  const outputValue = editor.value.toJSON(opts);
  editor.setValue(input);
  const inputValue = editor.value.toJSON(opts);
  editor.setValue(input);
  fn(editor, ...args);
  editor.flush();
  expect(editor.value.toJSON(opts)).toEqual(outputValue);
  editor.undo();
  editor.flush();
  expect(editor.value.toJSON(opts)).toEqual(inputValue);
  editor.redo();
  editor.flush();
  expect(editor.value.toJSON(opts)).toEqual(outputValue);
};

export const fixtures = (...args) => {
  let fn = args.pop();
  let options = { skip: false };

  if (typeof fn !== "function") {
    options = fn;
    fn = args.pop();
  }

  const path = resolve(...args);
  const files = fs.readdirSync(path);
  const dir = basename(path);
  const d = options.skip ? describe.skip : describe;

  d(dir, () => {
    for (const file of files) {
      const p = resolve(path, file);
      const stat = fs.statSync(p);

      if (stat.isDirectory()) {
        fixtures(path, file, fn);
      }

      if (
        stat.isFile() &&
        file.endsWith(".js") &&
        !file.startsWith(".") &&
        // Ignoring `index.js` files allows us to use the fixtures directly
        // from the top-level directory itself, instead of only children.
        file !== "index.js"
      ) {
        const name = basename(file, extname(file));

        // This needs to be a non-arrow function to use `this.skip()`.
        it(name, function() {
          // Ensure that the key generator is reset. We have to do this here
          // because the `require` call will create the Slate objects.
          KeyUtils.resetGenerator();
          const module = require(p);

          if (module.skip) {
            this.skip();
            return;
          }

          fn({ name, path, module });
        });
      }
    }
  });
};

fixtures.skip = (...args) => {
  fixtures(...args, { skip: true });
};
