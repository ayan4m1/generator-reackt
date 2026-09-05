import { src } from '../util/fs.js';
import BaseGenerator from '../util/generator.js';
import { ModuleAnswers, TestFrameworks } from '../types/index.js';

export default class extends BaseGenerator {
  protected templateDirectory() {
    return 'component';
  }

  #testFramework() {
    return this.config.get('testFramework') as string | undefined;
  }

  #addRedus() {
    return this.config.get('flags.addRedux') as boolean | undefined;
  }

  #addStorybook() {
    return this.config.get('flags.addStorybook') as boolean | undefined;
  }

  async prompting() {
    // an unset value means the project predates this key, so still offer tests;
    // an explicit TestFrameworks.None means the app opted out of testing
    const testFramework = this.#testFramework();
    const addRedux = this.#addRedus();
    const addStorybook = this.#addStorybook();

    const answers = await this.prompt<ModuleAnswers>([
      {
        type: 'input',
        name: 'component.name',
        message: 'Component name'
      },
      {
        type: 'confirm',
        name: 'flags.addRedux',
        message: 'Connect this component to the Redux store?',
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
    this.answers = { ...this.answers, ...answers };
  }

  async writing() {
    const {
      flags,
      component: { name }
    } = this.answers;

    if (!name) {
      this.log('ERROR: No component name provided!');
      return;
    }

    const fileName = src('components', `${name}.tsx`);
    const testName = src('components', `${name}.test.tsx`);

    this.log(`Creating ${name} component`);
    this.fileSystem.copyTemplate('index.tsx', fileName);

    if (flags.addTest) {
      this.fileSystem.copyTemplate(
        this.#testFramework() === TestFrameworks.ReactTestingLibrary
          ? 'index.rtl.test.tsx'
          : 'index.jest.test.tsx',
        testName
      );
    }

    if (flags.addStorybook) {
      this.fileSystem.copyTemplate(
        'index.stories.tsx',
        src('components', `${name}.stories.tsx`)
      );
    }
  }
}
