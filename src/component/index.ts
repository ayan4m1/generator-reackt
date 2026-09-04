import { src } from '../util/fs.js';
import BaseGenerator from '../util/generator.js';
import { ModuleAnswers } from '../types/index.js';

export default class extends BaseGenerator {
  protected templateDirectory() {
    return 'component';
  }

  async prompting() {
    this.answers = (await this.prompt([
      {
        type: 'input',
        name: 'component.name',
        message: 'Component name'
      },
      {
        type: 'confirm',
        name: 'flags.addRedux',
        message: 'Connect this component to the Redux store?',
        default: false
      },
      {
        type: 'confirm',
        name: 'flags.addStorybook',
        message: 'Add a Storybook story?',
        default: false
      }
    ])) as unknown as ModuleAnswers;
  }

  async writing() {
    const {
      flags,
      component: { name }
    } = this.answers;
    const fileName = src('components', `${name}.tsx`);
    const testName = src('components', `${name}.test.tsx`);

    this.log(`Creating ${name} component`);
    this.fileSystem.copyTemplate('index.tsx', fileName);
    this.fileSystem.copyTemplate('index.test.tsx', testName);

    if (flags.addStorybook) {
      this.fileSystem.copyTemplate(
        'index.stories.tsx',
        src('components', `${name}.stories.tsx`)
      );
    }
  }
}
