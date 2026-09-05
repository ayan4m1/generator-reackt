import { src } from '../util/fs.js';
import BaseGenerator from '../util/generator.js';
import { ModuleAnswers, TestFrameworks } from '../types/index.js';

export default class extends BaseGenerator {
  protected templateDirectory(): string {
    return 'page';
  }

  #testFramework() {
    return this.config.get('testFramework') as string | undefined;
  }

  #addRedux() {
    return this.config.get('flags.addRedux') as boolean | undefined;
  }

  #addStorybook() {
    return this.config.get('flags.addStorybook') as boolean | undefined;
  }

  // a page is only reachable once it is in the route table, and the nav is
  // derived from that same table
  #registerRoute(name: string, url: string) {
    const routesPath = this.destinationPath(src('routes.tsx'));

    if (!this.fs.exists(routesPath)) {
      this.log('WARNING: src/routes.tsx is missing, skipping route');
      return;
    }

    const contents = this.fs.read(routesPath);

    if (contents.includes(`./pages/${name}`)) {
      return;
    }

    const anchor = 'export const routes: AppRoute[] = [';

    if (!contents.includes(anchor)) {
      this.log('WARNING: could not find the route table, skipping route');
      return;
    }

    this.fs.write(
      routesPath,
      contents.replace(
        anchor,
        [
          anchor,
          '  {',
          `    path: '${url}',`,
          `    handle: { title: '${name}' },`,
          `    lazy: () => import(\`./pages/${name}\`)`,
          '  },'
        ].join('\n')
      )
    );
  }

  async prompting() {
    // an unset value means the project predates this key, so still offer tests;
    // an explicit TestFrameworks.None means the app opted out of testing
    const testFramework = this.#testFramework();
    const addRedux = this.#addRedux();
    const addStorybook = this.#addStorybook();

    this.answers = await this.prompt<ModuleAnswers>([
      {
        type: 'input',
        name: 'page.name',
        message: 'Page name'
      },
      {
        type: 'input',
        name: 'page.url',
        message: 'Page URL'
      },
      {
        type: 'confirm',
        name: 'flags.addRedux',
        message: 'Connect this page to the Redux store?',
        default: true,
        when: () => addRedux
      },
      {
        type: 'confirm',
        name: 'flags.addStorybook',
        message: 'Add a Storybook story?',
        default: true,
        when: () => addStorybook
      },
      {
        type: 'confirm',
        name: 'flags.addTest',
        message: 'Add a test case?',
        default: true,
        when: () => testFramework !== TestFrameworks.None
      }
    ]);
  }

  async writing() {
    const {
      flags,
      page: { name, url }
    } = this.answers;

    if (!name) {
      this.log('ERROR: No page name provided!');
      return;
    }

    this.log(`Creating ${name} page`);
    this.fileSystem.copyTemplate('index.tsx', src('pages', `${name}.tsx`));

    if (flags.addTest) {
      this.fileSystem.copyTemplate(
        this.#testFramework() === TestFrameworks.ReactTestingLibrary
          ? 'index.rtl.test.tsx'
          : 'index.jest.test.tsx',
        src('pages', `${name}.test.tsx`)
      );
    }

    if (flags.addStorybook) {
      this.fileSystem.copyTemplate(
        'index.stories.tsx',
        src('pages', `${name}.stories.tsx`)
      );
    }

    // child routes of the '/' route are relative, and the index route already
    // owns the empty path
    const routePath = (url ?? '').replace(/^\/+|\/+$/g, '');

    if (!routePath) {
      this.log('WARNING: No page URL provided, skipping route');
      return;
    }

    this.#registerRoute(name, routePath);
  }
}
