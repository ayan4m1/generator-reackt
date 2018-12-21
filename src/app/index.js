import path from 'path';
import mkdirp from 'mkdirp';
import { format } from 'date-fns';
import request from 'request-promise-native';
import spdxIdentifiers from 'spdx-license-ids';

spdxIdentifiers.push('SEE LICENSE IN LICENSE');
spdxIdentifiers.sort();

// we cannot use ES6 imports on this object, as it directly exports a class to
// module.exports - no default export nor a named export is present for us to use
const Generator = require('yeoman-generator');

const styleFrameworks = [
  { value: null, name: 'None' },
  { value: 'bootstrap', name: 'Bootstrap' },
  { value: 'uikit', name: 'UIKit' },
  { value: 'foundation', name: 'Foundation' },
  { value: 'materialize', name: 'Materialize' }
];
const packages = {
  fontAwesome: [
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/react-fontawesome'
  ],
  bootstrap: ['bootstrap'],
  uikit: ['uikit'],
  foundation: ['foundation-sites'],
  materialize: ['materialize-css'],
  lintStaged: ['husky', 'lint-staged'],
  redux: ['redux', 'react-redux', 'redux-saga'],
  core: ['normalize-scss', 'prop-types', 'react', 'react-dom', 'reselect'],
  esdoc: [
    'esdoc',
    'esdoc-ecmascript-proposal-plugin',
    'esdoc-jsx-plugin',
    'esdoc-standard-plugin'
  ],
  jest: ['babel-core@^7.0.0-0', 'babel-jest', 'eslint-plugin-jest', 'jest'],
  dev: [
    '@babel/core',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/polyfill',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/register',
    'autoprefixer',
    'babel-eslint',
    'babel-loader',
    'clean-webpack-plugin',
    'cross-env',
    'css-loader',
    'eslint',
    'eslint-config-prettier',
    'eslint-import-resolver-webpack',
    'eslint-loader',
    'eslint-plugin-import',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-prettier',
    'eslint-plugin-react',
    'html-loader',
    'html-webpack-plugin',
    'mini-css-extract-plugin',
    'node-sass',
    'optimize-css-assets-webpack-plugin',
    'postcss-flexbugs-fixes',
    'postcss-loader',
    'prettier',
    'prettier-eslint',
    'sass-loader',
    'style-loader',
    'stylelint',
    'stylelint-a11y',
    'stylelint-config-recommended',
    'stylelint-webpack-plugin',
    'uglifyjs-webpack-plugin',
    'webpack',
    'webpack-cli',
    'webpack-dev-server'
  ]
};
const files = {
  core: [
    '.babelrc',
    '.gitignore',
    '.prettierrc',
    '.stylelintrc',
    'webpack.config.babel.js'
  ],
  templated: ['.eslintrc.js', 'package.json', 'src/index.js', 'src/index.scss'],
  jest: ['jest.config.js'],
  lintStaged: ['.huskyrc', '.lintstagedrc']
};
const scripts = {
  esdoc: {
    'build:documentation': 'esdoc'
  },
  jest: {
    test: 'jest'
  }
};

export default class extends Generator {
  constructor(...args) {
    super(...args);

    this.env.adapter.promptModule.registerPrompt(
      'autocomplete',
      require('inquirer-autocomplete-prompt')
    );
    this.sourceRoot(path.join(__dirname, '..', '..', 'templates', 'app'));

    this.answers = {};
    this.fileSystem = {
      copy: file => {
        this.fs.copy(
          this.templatePath(file),
          this.destinationPath(file),
          this.answers
        );
      },
      copyTemplate: file => {
        this.fs.copyTpl(
          this.templatePath(file),
          this.destinationPath(file),
          this.answers
        );
      },
      createFile: (file, contents) => {
        this.fs.write(this.destinationPath(file), contents);
      },
      makeDirectory: mkdirp
    };
  }

  async prompting() {
    const { name, email } = this.user.git;

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'package.name',
        message: 'Package name',
        default: this.appname
      },
      {
        type: 'input',
        name: 'package.version',
        message: 'Package version',
        default: '0.1.0'
      },
      {
        type: 'autocomplete',
        name: 'package.license',
        message: 'Package license',
        source: (results, input) => {
          const pattern = new RegExp(`.*${input}.*`, 'i');

          return new Promise(resolve => {
            resolve(
              spdxIdentifiers.filter(identifier => pattern.test(identifier))
            );
          });
        }
      },
      {
        type: 'input',
        name: 'package.description',
        message: 'Package description'
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
        type: 'list',
        name: 'styleFramework',
        message: 'What CSS framework would you like to use?',
        choices: styleFrameworks
      },
      {
        type: 'confirm',
        name: 'flags.addLintStaged',
        message: 'Install pre-commit linting hook?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addFontAwesome',
        message: 'Install Font Awesome?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addRedux',
        message: 'Install Redux?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addJest',
        message: 'Install Jest?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addESDoc',
        message: 'Install ESDoc?',
        default: false
      }
    ]);
  }

  async writing() {
    const { author, flags } = this.answers;
    const { name, email } = author;
    const { license } = this.answers.package;

    let licenseText = 'Place your license here.\n';

    if (license !== 'SEE LICENSE IN LICENSE') {
      const rawLicense = await request(
        `https://raw.githubusercontent.com/spdx/license-list-data/master/text/${license}.txt`
      );

      licenseText = rawLicense
        .replace('<year>', format(new Date(), 'YYYY'))
        .replace('<copyright holders>', `${name} <${email}>`);
    }
    this.fileSystem.createFile('LICENSE', licenseText);

    files.templated.forEach(this.fileSystem.copyTemplate);
    files.core.forEach(this.fileSystem.copy);

    await this.fileSystem.makeDirectory(this.destinationPath('src/components'));

    if (flags.addRedux) {
      await this.fileSystem.makeDirectory(this.destinationPath('src/modules'));
    }

    if (flags.addJest) {
      files.jest.forEach(this.fileSystem.copy);
      this.fs.append(this.destinationPath('.gitignore'), 'coverage/');
      this.fs.extendJSON(this.destinationPath('package.json'), {
        scripts: {
          ...scripts.jest
        }
      });
    }

    if (flags.addESDoc) {
      this.fs.append(this.destinationPath('.gitignore'), 'docs/');
      this.fs.extendJSON(this.destinationPath('package.json'), {
        scripts: {
          ...scripts.esdoc
        }
      });
    }

    if (flags.addLintStaged) {
      files.lintStaged.forEach(this.fileSystem.copy);
    }
  }

  install() {
    const main = [];
    const dev = [];
    const { flags, styleFramework } = this.answers;

    main.push.apply(main, packages.core);
    dev.push.apply(dev, packages.dev);

    if (styleFramework !== null) {
      main.push.apply(main, packages[styleFramework]);
    }

    if (flags.addLintStaged) {
      dev.push.apply(dev, packages.lintStaged);
    }

    if (flags.addFontAwesome) {
      main.push.apply(main, packages.fontAwesome);
    }

    if (flags.addRedux) {
      main.push.apply(main, packages.redux);
    }

    if (flags.addJest) {
      dev.push.apply(dev, packages.jest);
    }

    if (flags.addESDoc) {
      main.push.apply(main, packages.esdoc);
    }

    this.log(
      `Getting ready to install ${main.length} dependencies and ${
        dev.length
      } dev dependencies.`
    );
    this.npmInstall(main, { save: true });
    this.npmInstall(dev, { 'save-dev': true });
  }
}
