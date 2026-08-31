import { join } from 'path';
import Generator, {
  type BaseFeatures,
  type BaseOptions
} from 'yeoman-generator';

import fileSystem from '../util/fs.js';
import { CustomGenerator, FS, ModuleAnswers } from '../types/index.js';

const src = (...paths: string[]) => join('src', ...paths);

export default class extends Generator implements CustomGenerator {
  answers: ModuleAnswers;
  fileSystem: FS;

  constructor(args: string[], options: BaseOptions, features?: BaseFeatures) {
    super(args, options, features);

    this.answers = {
      component: {},
      deploy: {},
      module: {},
      package: {},
      author: {},
      flags: {}
    };
    this.fileSystem = fileSystem(this);
    this.sourceRoot(this.fileSystem.resolve('templates', 'component'));
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
    const fileName = src('components', `${name}.js`);
    const testName = src('components', `${name}.test.js`);

    this.log(`Creating ${name} component`);
    this.fileSystem.copyTemplate('index.js', fileName);
    this.fileSystem.copyTemplate('index.test.js', testName);

    if (flags.addStorybook) {
      this.fileSystem.copyTemplate(
        'index.stories.tsx',
        src('components', `${name}.stories.tsx`)
      );
    }
  }
}
