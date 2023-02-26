import { join, dirname } from 'path';
import { createRequire } from 'module';

import fileSystem from '../util/fs.js';

// we cannot use ES6 imports on this object, as it directly exports a class to
// module.exports - no default export nor a named export is present for us to use
const require = createRequire(import.meta.url);
const Generator = require('yeoman-generator');

const src = (...paths) => join('src', ...paths);

export default class extends Generator {
  constructor(...args) {
    super(...args);

    this.sourceRoot(
      join(dirname(import.meta.url), '..', '..', 'templates', 'component')
    );
    this.answers = {};
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
    await this.fileSystem.copyTemplate('index.js', fileName);
    await this.fileSystem.copyTemplate('index.test.js', testName);
  }
}
