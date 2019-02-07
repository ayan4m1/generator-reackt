import { join } from 'path';

// we cannot use ES6 imports on this object, as it directly exports a class to
// module.exports - no default export nor a named export is present for us to use
const Generator = require('yeoman-generator');

const src = (...paths) => join('src', ...paths);

export default class extends Generator {
  constructor(...args) {
    super(...args);

    this.sourceRoot(join(__dirname, '..', '..', 'templates', 'module'));
    this.answers = {};
    this.fileSystem = {
      copy: file => {
        this.fs.copy(this.templatePath(file), this.destinationPath(file));
      },
      copyTemplate: (source, destination) => {
        this.fs.copyTpl(
          this.templatePath(source),
          this.destinationPath(destination),
          this.answers
        );
      },
      createFile: (file, contents) => {
        this.fs.write(this.destinationPath(file), contents);
      }
    };
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
            name:
              'Create a directory with the module name and an index.js file inside that.',
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

    const buildPaths = ext => {
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
