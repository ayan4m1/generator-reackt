import { join } from 'path';

import { src } from '../util/fs';
import BaseGenerator from '../util/generator';
import { ModuleAnswers, TestFrameworks } from '../types';

export default class extends BaseGenerator {
  protected templateDirectory() {
    return 'module';
  }

  // a generated module owns a slice of the store, so AppState has to learn
  // about it or nothing downstream of the reducer will type check
  #extendAppState(name: string) {
    const typesPath = this.destinationPath(src('types', 'index.ts'));

    if (!this.fs.exists(typesPath)) {
      this.log('WARNING: src/types/index.ts is missing, skipping AppState');
      return;
    }

    const stateType = `${name.charAt(0).toUpperCase()}${name.slice(1)}State`;
    const contents = this.fs.read(typesPath);

    if (contents.includes(`export type ${stateType}`)) {
      return;
    }

    const anchor = 'export type AppState = {';

    if (!contents.includes(anchor)) {
      this.log('WARNING: could not find AppState, skipping AppState update');
      return;
    }

    this.fs.write(
      typesPath,
      contents.replace(
        anchor,
        [
          `export type ${stateType} = Record<string, never>;`,
          '',
          anchor,
          // optional because the slice only exists once its reducer is
          // registered with the root reducer
          `  ${name}?: ${stateType};`
        ].join('\n')
      )
    );
  }

  async prompting() {
    // an unset value means the project predates this key, so still offer tests;
    // an explicit TestFrameworks.None means the app opted out of testing
    const testFramework = this.config.get('testFramework') as
      string | undefined;

    this.answers = await this.prompt<ModuleAnswers>([
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
        name: 'flags.addTest',
        message: 'Add a test case?',
        default: true,
        when: () => testFramework !== TestFrameworks.None
      }
    ]);
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

    this.#extendAppState(name);

    buildPaths('.ts');

    if (flags.addTest) {
      buildPaths('.test.ts');
    }
  }
}
