import path from 'path';
import spdxIdentifiers from 'spdx-license-ids';

// we cannot use ES6 imports on this object, as it directly exports a class to
// module.exports - no default export nor a named export is present for us to use
const Generator = require('yeoman-generator');

export default class extends Generator {
  constructor(...args) {
    super(...args);

    this.env.adapter.promptModule.registerPrompt(
      'autocomplete',
      require('inquirer-autocomplete-prompt')
    );
    this.sourceRoot(path.join(__dirname, '..', '..', 'templates', 'app'));
  }

  async prompting() {
    const { name, email } = this.user.git;

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'project.name',
        message: 'Project name',
        default: this.appname
      },
      {
        type: 'input',
        name: 'project.version',
        message: 'Starting version number',
        default: '0.1.0'
      },
      {
        type: 'autocomplete',
        name: 'project.license',
        message: 'License (SPDX identifier)',
        source: (results, input) => {
          const pattern = new RegExp(`.*${input}.*`, 'i');

          return new Promise(resolve => {
            resolve(
              spdxIdentifiers
                .filter(identifier => pattern.test(identifier))
                .sort()
            );
          });
        }
      },
      {
        type: 'input',
        name: 'author.name',
        message: 'Author name',
        default: name()
      },
      {
        type: 'input',
        name: 'author.email',
        message: 'Author email address',
        default: email()
      },
      {
        type: 'checkbox',
        name: 'flags.failOnLinter',
        message: 'Should linting errors prevent commits?',
        default: true
      }
    ]);
  }

  configuring() {
    this.log('configure');
  }

  writing() {
    this.log('write');
    this.log(this.answers);
  }

  install() {
    this.log('install');
  }
}
