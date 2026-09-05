import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import helpers, { type RunResult } from 'yeoman-test';

const generator = fileURLToPath(
  new URL('../generators/module', import.meta.url)
);

// templates are checked out with native line endings, so compare on content
const lf = (contents: string) => contents.replace(/\r\n/g, '\n');

// the app template wraps AppState in an addRedux conditional, so drop the ejs
// control lines to get the types file a redux project actually ends up with
const appTypes = lf(
  readFileSync(
    fileURLToPath(
      new URL('../templates/app/src/types/index.ts', import.meta.url)
    ),
    'utf8'
  )
).replace(/^<%.*%>\n/gm, '');

type RunOptions = {
  name?: string;
  directoryMode?: 'dir' | 'file';
  flags?: Record<string, boolean>;
  config?: Record<string, unknown>;
  types?: string | null;
};

const run = ({
  name = 'cart',
  directoryMode = 'file',
  flags = {},
  config = { testFramework: 'rtl' },
  types = appTypes
}: RunOptions = {}): Promise<RunResult> =>
  helpers
    .run(generator)
    .withAnswers({
      'module.name': name,
      directoryMode,
      'flags.createReducer': true,
      'flags.createSaga': true,
      'flags.createSelector': true,
      ...flags
    })
    .withLocalConfig(config)
    .withFiles(types === null ? {} : { 'src/types/index.ts': types });

const readTypes = (result: RunResult) =>
  lf(readFileSync(`${result.cwd}/src/types/index.ts`, 'utf8'));

describe('reackt:module', () => {
  describe('file mode', () => {
    it('writes the reducer, saga and selector as named files', async () => {
      const result = await run();

      result.assertFile([
        'src/reducers/cart.ts',
        'src/sagas/cart.ts',
        'src/selectors/cart.ts'
      ]);
    });

    it('points the imports one directory up', async () => {
      const result = await run();

      result.assertFileContent('src/selectors/cart.ts', "from '../types'");
      result.assertFileContent('src/reducers/cart.ts', "from '../utils'");
    });

    it('writes the tests alongside the module', async () => {
      const result = await run();

      result.assertFile([
        'src/reducers/cart.test.ts',
        'src/sagas/cart.test.ts',
        'src/selectors/cart.test.ts'
      ]);
      result.assertFileContent('src/reducers/cart.test.ts', "from './cart'");
    });
  });

  describe('directory mode', () => {
    it('writes each module as a directory with an index', async () => {
      const result = await run({ directoryMode: 'dir' });

      result.assertFile([
        'src/reducers/cart/index.ts',
        'src/sagas/cart/index.ts',
        'src/selectors/cart/index.ts'
      ]);
    });

    it('points the imports two directories up', async () => {
      const result = await run({ directoryMode: 'dir' });

      result.assertFileContent(
        'src/selectors/cart/index.ts',
        "from '../../types'"
      );
    });

    it('writes the tests inside the directory', async () => {
      const result = await run({ directoryMode: 'dir' });

      result.assertFile('src/reducers/cart/index.test.ts');
      result.assertFileContent(
        'src/reducers/cart/index.test.ts',
        "from './index'"
      );
    });
  });

  describe('the generated pieces', () => {
    it('namespaces the action types with the module name', async () => {
      const result = await run();

      result.assertFileContent(
        'src/reducers/cart.ts',
        "buildActions('cart', ['INIT_APP'])"
      );
    });

    it('names the selector after the module', async () => {
      const result = await run();

      result.assertFileContent('src/selectors/cart.ts', 'export const getCart');
    });

    it('skips the pieces the project turned down', async () => {
      const result = await run({
        flags: { 'flags.createSaga': false, 'flags.createSelector': false }
      });

      result.assertFile('src/reducers/cart.ts');
      result.assertNoFile(['src/sagas/cart.ts', 'src/selectors/cart.ts']);
    });

    it('skips the tests when the project opted out of testing', async () => {
      const result = await run({ config: { testFramework: '' } });

      result.assertFile('src/reducers/cart.ts');
      result.assertNoFile('src/reducers/cart.test.ts');
    });

    it('does nothing without a module name', async () => {
      const result = await run({ name: '' });

      result.assertNoFile('src/reducers/.ts');
      assert.equal(readTypes(result), appTypes);
    });
  });

  describe('AppState', () => {
    it('declares a state type for the module', async () => {
      const result = await run();

      result.assertFileContent(
        'src/types/index.ts',
        'export type CartState = Record<string, never>;'
      );
    });

    it('adds the slice to AppState as optional', async () => {
      const result = await run();

      result.assertFileContent('src/types/index.ts', '  cart?: CartState;');
      result.assertFileContent(
        'src/types/index.ts',
        'export type AppState = {'
      );
    });

    it('keeps the existing application slice', async () => {
      const result = await run();

      result.assertFileContent('src/types/index.ts', 'application: {');
    });

    it('does not declare the same module twice', async () => {
      const once = await run();
      const extended = readTypes(once);

      const twice = await run({ types: extended });

      assert.equal(readTypes(twice), extended);
    });

    it('produces a types file matching the project code style', async () => {
      const result = await run();
      const { format, resolveConfig } = await import('prettier');
      const config = await resolveConfig(
        fileURLToPath(new URL('../.prettierrc', import.meta.url))
      );
      const types = readTypes(result);

      assert.equal(
        types,
        await format(types, { ...config, parser: 'typescript' })
      );
    });
  });

  describe('projects without an AppState', () => {
    it('still writes the module when src/types/index.ts is missing', async () => {
      const result = await run({ types: null });

      result.assertFile('src/reducers/cart.ts');
      result.assertNoFile('src/types/index.ts');
    });

    it('still writes the module when the anchor is missing', async () => {
      // what a non-redux project gets, since AppState is behind addRedux
      const result = await run({ types: '' });

      result.assertFile('src/reducers/cart.ts');
      assert.equal(readTypes(result), '');
    });
  });
});
