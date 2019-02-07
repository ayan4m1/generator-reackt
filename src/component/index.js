import { join } from 'path';

// we cannot use ES6 imports on this object, as it directly exports a class to
// module.exports - no default export nor a named export is present for us to use
const Generator = require('yeoman-generator');

const src = (...paths) => join('src', ...paths);

export default class extends Generator {
  constructor(...args) {
    super(...args);

    this.sourceRoot(join(__dirname, '..', '..', 'templates', 'component'));
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
    await this.fileSystem.copyTemplate('index.js', fileName);
    await this.fileSystem.copyTemplate('index.test.js', testName);
  }
}
