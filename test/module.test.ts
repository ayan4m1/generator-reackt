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

// the exact root files the app generator emits, so a change to either side of
// the registration fails these tests rather than silently breaking the wiring
const template = (name: string) =>
  lf(
    readFileSync(
      fileURLToPath(
        new URL(`../templates/app/src/${name}/index.ts`, import.meta.url)
      ),
      'utf8'
    )
  );

const appReducers = template('reducers');
const appSagas = template('sagas');

type RunOptions = {
  name?: string;
  directoryMode?: 'dir' | 'file';
  flags?: Record<string, boolean>;
  config?: Record<string, unknown>;
  types?: string | null;
  reducers?: string | null;
  sagas?: string | null;
};

const run = ({
  name = 'cart',
  directoryMode = 'file',
  flags = {},
  config = { testFramework: 'rtl' },
  types = appTypes,
  reducers = appReducers,
  sagas = appSagas
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
    .withFiles({
      ...(types === null ? {} : { 'src/types/index.ts': types }),
      ...(reducers === null ? {} : { 'src/reducers/index.ts': reducers }),
      ...(sagas === null ? {} : { 'src/sagas/index.ts': sagas })
    });

const read = (result: RunResult, path: string) =>
  lf(readFileSync(`${result.cwd}/${path}`, 'utf8'));

const readTypes = (result: RunResult) => read(result, 'src/types/index.ts');
const readReducers = (result: RunResult) =>
  read(result, 'src/reducers/index.ts');
const readSagas = (result: RunResult) => read(result, 'src/sagas/index.ts');

// every file the generator edits in place has to come back out in the style the
// project already uses, which is the one thing ts-morph will not guarantee
const assertProjectStyle = async (contents: string) => {
  const { format, resolveConfig } = await import('prettier');
  const config = await resolveConfig(
    fileURLToPath(new URL('../.prettierrc', import.meta.url))
  );

  assert.equal(
    contents,
    await format(contents, { ...config, parser: 'typescript' })
  );
};

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

      await assertProjectStyle(readTypes(result));
    });
  });

  describe('the root reducer', () => {
    it('imports the module reducer under the module name', async () => {
      const result = await run();

      result.assertFileContent(
        'src/reducers/index.ts',
        "import { reducer as cart } from './cart';"
      );
    });

    it('adds the slice without dropping the existing ones', async () => {
      const result = await run();
      const combined = [
        'export default combineReducers({',
        '  application,',
        '  cart',
        '});'
      ].join('\n');

      assert.ok(readReducers(result).includes(combined), readReducers(result));
    });

    it('resolves a directory module through its index', async () => {
      const result = await run({ directoryMode: 'dir' });

      result.assertFileContent('src/reducers/index.ts', "from './cart'");
    });

    it('is left alone when the project turned the reducer down', async () => {
      const result = await run({ flags: { 'flags.createReducer': false } });

      assert.equal(readReducers(result), appReducers);
    });

    it('does not register the same module twice', async () => {
      const once = await run();
      const registered = readReducers(once);

      const twice = await run({ reducers: registered });

      assert.equal(readReducers(twice), registered);
    });

    it('still writes the module when the root reducer is missing', async () => {
      const result = await run({ reducers: null });

      result.assertFile('src/reducers/cart.ts');
      result.assertNoFile('src/reducers/index.ts');
    });

    it('leaves a root reducer it does not recognize alone', async () => {
      const unrecognized = 'export const reducers = {};\n';
      const result = await run({ reducers: unrecognized });

      result.assertFile('src/reducers/cart.ts');
      assert.equal(readReducers(result), unrecognized);
    });

    it('produces a file matching the project code style', async () => {
      const result = await run();

      await assertProjectStyle(readReducers(result));
    });
  });

  describe('the root saga', () => {
    it('imports the module saga', async () => {
      const result = await run();

      result.assertFileContent(
        'src/sagas/index.ts',
        "import cart from './cart';"
      );
    });

    it('forks it alongside the existing ones', async () => {
      const result = await run();
      const body = [
        'export default function* saga() {',
        '  yield fork(application);',
        '  yield fork(cart);',
        '}'
      ].join('\n');

      assert.ok(readSagas(result).includes(body), readSagas(result));
    });

    it('is left alone when the project turned the saga down', async () => {
      const result = await run({ flags: { 'flags.createSaga': false } });

      assert.equal(readSagas(result), appSagas);
    });

    it('does not register the same module twice', async () => {
      const once = await run();
      const registered = readSagas(once);

      const twice = await run({ sagas: registered });

      assert.equal(readSagas(twice), registered);
    });

    it('still writes the module when the root saga is missing', async () => {
      const result = await run({ sagas: null });

      result.assertFile('src/sagas/cart.ts');
      result.assertNoFile('src/sagas/index.ts');
    });

    it('produces a file matching the project code style', async () => {
      const result = await run();

      await assertProjectStyle(readSagas(result));
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
