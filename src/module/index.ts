import { join } from 'path';

import { src } from '../util/fs.js';
import BaseGenerator from '../util/generator.js';
import { ModuleAnswers } from '../types/index.js';

export default class extends BaseGenerator {
  protected templateDirectory() {
    return 'module';
  }

  async prompting() {
    this.answers = (await this.prompt([
      {
        type: 'input',
        name: 'module.name',
        message: 'Module name'
      },
      {
        type: 'select',
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
    ])) as unknown as ModuleAnswers;
  }

  async writing() {
    const {
      directoryMode,
      module: { name },
      flags
    } = this.answers;

    if (!name) {
      this.log('ERROR: No module name provided!');
      return;
    }

    this.log(`Creating module ${name}`);

    const buildPaths = (ext: string) => {
      const namePath = `${name}${ext}`;
      const indexPath = `index${ext}`;
      const destPath: string[] = [];

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

    buildPaths('.ts');

    if (flags.addJest) {
      buildPaths('.test.ts');
    }
  }
}
