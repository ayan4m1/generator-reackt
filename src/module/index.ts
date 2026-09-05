import { join } from 'path';

import { src } from '../util/fs';
import BaseGenerator from '../util/generator';
import { addStateSlice, registerReducer, registerSaga } from '../util/ast';
import { TestFrameworks } from '../types';

export default class extends BaseGenerator {
  protected templateDirectory() {
    return 'module';
  }

  async prompting() {
    // an unset value means the project predates this key, so still offer tests;
    // an explicit TestFrameworks.None means the app opted out of testing
    const testFramework = this.config.get('testFramework') as
      string | undefined;

    const answers = await this.prompt([
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
            name: 'Create a file with the module name.',
            value: 'file',
            short: 'File'
          },
          {
            name: 'Create a directory with the module name and an index.ts file inside that.',
            value: 'dir',
            short: 'Directory'
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

    // the state type, the root reducer and the root saga all have to learn
    // about the module, or it is generated but inert
    this.editSource(src('types', 'index.ts'), 'AppState', (contents) =>
      addStateSlice(contents, name)
    );

    if (flags.createReducer) {
      this.editSource(
        src('reducers', 'index.ts'),
        'the root reducer',
        (contents) => registerReducer(contents, name)
      );
    }

    if (flags.createSaga) {
      this.editSource(src('sagas', 'index.ts'), 'the root saga', (contents) =>
        registerSaga(contents, name)
      );
    }

    buildPaths('.ts');

    if (flags.addTest) {
      buildPaths('.test.ts');
    }
  }
}
