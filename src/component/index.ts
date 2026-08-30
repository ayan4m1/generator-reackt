import { join } from 'path';
import { fileURLToPath } from 'url';
import Generator, { GeneratorOptions } from 'yeoman-generator';

import fileSystem from '../util/fs.js';
import { CustomGenerator, FS, ModuleAnswers } from '../types/index.js';

const __dirname = fileURLToPath(import.meta.url);

const src = (...paths: string[]) => join('src', ...paths);

export default class extends Generator implements CustomGenerator {
  answers: ModuleAnswers;
  fileSystem: FS;

  constructor(args: string[], options: GeneratorOptions) {
    super(args, options);

    this.sourceRoot(join(__dirname, '..', '..', 'templates', 'component'));
    this.answers = {
      component: {},
      module: {},
      package: {},
      author: {},
      flags: {}
    };
    this.fileSystem = fileSystem(this);
  }

  async prompting() {
    this.answers = await this.prompt([
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
      }
    ]);
  }

  async writing() {
    const {
      component: { name }
    } = this.answers;
    const fileName = src('components', `${name}.js`);
    const testName = src('components', `${name}.test.js`);

    this.log(`Creating ${name} component`);
    this.fileSystem.copyTemplate('index.js', fileName);
    this.fileSystem.copyTemplate('index.test.js', testName);
  }
}
