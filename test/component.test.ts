import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import helpers, { type RunResult } from 'yeoman-test';

const generator = fileURLToPath(
  new URL('../generators/component', import.meta.url)
);

type RunOptions = {
  name?: string;
  config?: Record<string, unknown>;
};

const run = ({
  name = 'Widget',
  config = { testFramework: 'rtl' }
}: RunOptions = {}): Promise<RunResult> =>
  helpers
    .run(generator)
    .withAnswers({ 'component.name': name })
    .withLocalConfig(config);

describe('reackt:component', () => {
  describe('the component', () => {
    it('is written to src/components using the component name', async () => {
      const result = await run();

      result.assertFile('src/components/Widget.tsx');
      result.assertFileContent(
        'src/components/Widget.tsx',
        'function Widget()'
      );
      result.assertFileContent(
        'src/components/Widget.tsx',
        'export default Widget;'
      );
    });

    it('connects to redux when the project uses it', async () => {
      const result = await run({
        config: { testFramework: 'rtl', 'flags.addRedux': true }
      });

      result.assertFileContent(
        'src/components/Widget.tsx',
        "import { connect } from 'react-redux'"
      );
      result.assertFileContent(
        'src/components/Widget.tsx',
        'export default connect(null, null)(Widget);'
      );
    });

    it('does not connect to redux when the project does not use it', async () => {
      const result = await run();

      result.assertNoFileContent('src/components/Widget.tsx', 'react-redux');
    });

    it('does nothing without a component name', async () => {
      const result = await run({ name: '' });

      result.assertNoFile('src/components/.tsx');
    });

    // regression: prompt() only returns the questions it asked, so a project
    // that skips every flag prompt used to leave the templates without a flags
    // object and blow up inside ejs
    it('runs on a project that skips every flag prompt', async () => {
      const result = await run({ config: { testFramework: '' } });

      result.assertFile('src/components/Widget.tsx');
      result.assertNoFile('src/components/Widget.test.tsx');
      result.assertNoFile('src/components/Widget.stories.tsx');
    });
  });

  describe('the test case', () => {
    it('uses the react testing library template for rtl projects', async () => {
      const result = await run();

      result.assertFileContent(
        'src/components/Widget.test.tsx',
        '@testing-library/react'
      );
    });

    it('uses the snapshot template for jest projects', async () => {
      const result = await run({ config: { testFramework: 'jest' } });

      result.assertFileContent(
        'src/components/Widget.test.tsx',
        'react-test-renderer'
      );
    });

    it('is skipped when the project opted out of testing', async () => {
      const result = await run({ config: { testFramework: '' } });

      result.assertNoFile('src/components/Widget.test.tsx');
    });
  });

  describe('the story', () => {
    it('is written when the project uses storybook', async () => {
      const result = await run({
        config: { testFramework: 'rtl', 'flags.addStorybook': true }
      });

      result.assertFileContent(
        'src/components/Widget.stories.tsx',
        "title: 'Components/Widget'"
      );
    });

    it('is skipped when the project does not use storybook', async () => {
      const result = await run();

      result.assertNoFile('src/components/Widget.stories.tsx');
    });
  });
});
