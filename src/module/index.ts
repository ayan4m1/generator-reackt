import { join } from 'path';
import { fileURLToPath } from 'url';
import Generator, { GeneratorOptions } from 'yeoman-generator';

import fileSystem from '../util/fs.js';
import { CustomGenerator, FS, ModuleAnswers } from '../types';

const __dirname = fileURLToPath(import.meta.url);

const src = (...paths: string[]) => join('src', ...paths);

export default class extends Generator implements CustomGenerator {
  answers: ModuleAnswers;
  fileSystem: FS;

  constructor(args: string[], options: GeneratorOptions) {
    super(args, options);

    this.sourceRoot(join(__dirname, '..', '..', 'templates', 'module'));
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
        name: 'module.name',
        message: 'Module name'
      },
      {
        type: 'list',
        name: 'directoryMode',
        message: 'Choose a way of structuring the module.',
        choices: [
          {
            name: 'Create a directory with the module name and an index.js file inside that.',
            value: 'dir',
            short: 'Directory'
          },
          {
            name: 'Create a file with the module name.',
            value: 'file',
            short: 'File'
          }
        ]
      },
      {
        type: 'confirm',
        name: 'flags.createReducer',
        message: 'Generate a reducer?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.createSaga',
        message: 'Generate a saga?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.createSelector',
        message: 'Generate a selector?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addJest',
        message: 'Generate test files?',
        default: true
      }
    ]);
  }

  async writing() {
    const {
      directoryMode,
      module: { name },
      flags
    } = this.answers;

    this.log(`Creating module ${name}`);

    const buildPaths = (ext: string) => {
      const namePath = `${name}${ext}`;
      const indexPath = `index${ext}`;
      const destPath = [];

      switch (directoryMode) {
        default:
        case 'file':
          destPath.push(namePath);
          break;
        case 'dir':
          destPath.push(name, indexPath);
          break;
      }

      if (flags.createReducer) {
        this.fileSystem.copyTemplate(
          join('reducer', indexPath),
          src('reducers', ...destPath)
        );
      }

      if (flags.createSaga) {
        this.fileSystem.copyTemplate(
          join('saga', indexPath),
          src('sagas', ...destPath)
        );
      }

      if (flags.createSelector) {
        this.fileSystem.copyTemplate(
          join('selector', indexPath),
          src('selectors', ...destPath)
        );
      }
    };

    buildPaths('.js');

    if (flags.addJest) {
      buildPaths('.test.js');
    }
  }
}
