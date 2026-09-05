import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import helpers, { type RunResult } from 'yeoman-test';

const generator = fileURLToPath(new URL('../generators/page', import.meta.url));

// templates are checked out with native line endings, so compare on content
const lf = (contents: string) => contents.replace(/\r\n/g, '\n');

// the exact table the app generator emits, so a change to one side of the
// anchor fails these tests rather than silently breaking route registration
const routesTemplate = lf(
  readFileSync(
    fileURLToPath(new URL('../templates/app/src/routes.tsx', import.meta.url)),
    'utf8'
  )
);

type RunOptions = {
  name?: string;
  url?: string;
  config?: Record<string, unknown>;
  routes?: string | null;
};

const run = ({
  name = 'About',
  url = '/about',
  config = { testFramework: 'rtl' },
  routes = routesTemplate
}: RunOptions = {}): Promise<RunResult> =>
  helpers
    .run(generator)
    .withAnswers({ 'page.name': name, 'page.url': url })
    .withLocalConfig(config)
    .withFiles(routes === null ? {} : { 'src/routes.tsx': routes });

const readRoutes = (result: RunResult) =>
  lf(readFileSync(`${result.cwd}/src/routes.tsx`, 'utf8'));

describe('reackt:page', () => {
  describe('the page component', () => {
    it('is written to src/pages using the page name', async () => {
      const result = await run();

      result.assertFile('src/pages/About.tsx');
      result.assertFileContent('src/pages/About.tsx', 'function About()');
    });

    it('exports Component for react-router lazy() and a default', async () => {
      const result = await run();

      result.assertFileContent('src/pages/About.tsx', /export const Component/);
      result.assertFileContent(
        'src/pages/About.tsx',
        /export default Component/
      );
    });

    it('connects to redux when the project uses it', async () => {
      const result = await run({
        config: { testFramework: 'rtl', 'flags.addRedux': true }
      });

      result.assertFileContent(
        'src/pages/About.tsx',
        "import { connect } from 'react-redux'"
      );
      result.assertFileContent(
        'src/pages/About.tsx',
        'connect(null, null)(About)'
      );
    });

    it('does not connect to redux when the project does not use it', async () => {
      const result = await run();

      result.assertNoFileContent('src/pages/About.tsx', 'react-redux');
    });

    it('does nothing without a page name', async () => {
      const result = await run({ name: '' });

      result.assertNoFile('src/pages/.tsx');
      assert.equal(readRoutes(result), routesTemplate);
    });
  });

  describe('the test case', () => {
    it('uses the react testing library template for rtl projects', async () => {
      const result = await run();

      result.assertFileContent(
        'src/pages/About.test.tsx',
        '@testing-library/react'
      );
    });

    it('uses the snapshot template for jest projects', async () => {
      const result = await run({ config: { testFramework: 'jest' } });

      result.assertFileContent(
        'src/pages/About.test.tsx',
        'react-test-renderer'
      );
    });

    it('is skipped when the project opted out of testing', async () => {
      const result = await run({ config: { testFramework: '' } });

      result.assertNoFile('src/pages/About.test.tsx');
    });

    it('renders the page inside a MemoryRouter', async () => {
      const result = await run();

      result.assertFileContent('src/pages/About.test.tsx', '<MemoryRouter>');
    });
  });

  describe('the story', () => {
    it('is written when the project uses storybook', async () => {
      const result = await run({
        config: { testFramework: 'rtl', 'flags.addStorybook': true }
      });

      result.assertFileContent(
        'src/pages/About.stories.tsx',
        "title: 'Pages/About'"
      );
    });

    it('is skipped when the project does not use storybook', async () => {
      const result = await run();

      result.assertNoFile('src/pages/About.stories.tsx');
    });
  });

  describe('route registration', () => {
    it('adds an entry to the route table', async () => {
      const result = await run();

      const routes = readRoutes(result);
      const entry = [
        '  {',
        "    path: 'about',",
        "    handle: { title: 'About' },",
        '    lazy: () => import(`./pages/About`)',
        '  },'
      ].join('\n');

      assert.ok(routes.includes(entry), routes);
    });

    it('keeps the index route', async () => {
      const result = await run();

      result.assertFileContent('src/routes.tsx', 'index: true');
    });

    it('strips leading and trailing slashes from the url', async () => {
      const result = await run({ url: '/contact/us/' });

      result.assertFileContent('src/routes.tsx', "path: 'contact/us',");
    });

    it('leaves the table untouched when no url is given', async () => {
      const result = await run({ url: '   ' });

      result.assertFile('src/pages/About.tsx');
      assert.equal(readRoutes(result), routesTemplate);
    });

    it('does not register the same page twice', async () => {
      const once = await run();
      const registered = readRoutes(once);

      const twice = await run({ routes: registered });

      assert.equal(readRoutes(twice), registered);
    });

    it('produces a table matching the project code style', async () => {
      const result = await run();
      const { format, resolveConfig } = await import('prettier');
      const config = await resolveConfig(
        fileURLToPath(new URL('../.prettierrc', import.meta.url))
      );

      const routes = readRoutes(result);

      assert.equal(
        routes,
        await format(routes, { ...config, parser: 'typescript' })
      );
    });
  });

  describe('projects without a route table', () => {
    it('still writes the page when src/routes.tsx is missing', async () => {
      const result = await run({ routes: null });

      result.assertFile('src/pages/About.tsx');
      result.assertNoFile('src/routes.tsx');
    });

    it('still writes the page when the anchor is missing', async () => {
      const unrecognized = 'export const routes = [];\n';
      const result = await run({ routes: unrecognized });

      result.assertFile('src/pages/About.tsx');
      assert.equal(readRoutes(result), unrecognized);
    });
  });
});
