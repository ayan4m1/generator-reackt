import { join } from 'path';
import gulpIf from 'gulp-if';
import { format } from 'date-fns';
import fileSystem from '../util/fs';
import prettier from 'gulp-prettier';
import { readFileSync } from 'jsonfile';
import stylelint from 'yeoman-stylelint';
import request from 'request-promise-native';
import spdxIdentifiers from 'spdx-license-ids';

spdxIdentifiers.push('SEE LICENSE IN LICENSE');
spdxIdentifiers.sort();

// we cannot use ES6 imports on this object, as it directly exports a class to
// module.exports - no default export nor a named export is present for us to use
const Generator = require('yeoman-generator');

const src = (...paths) => join('src', ...paths);

const getPrettierConfig = () =>
  readFileSync(join(__dirname, '..', '..', '.prettierrc'));

const styleFrameworks = [
  { value: null, name: 'None' },
  { value: 'bootstrap', name: 'Bootstrap' },
  { value: 'bulma', name: 'Bulma' },
  { value: 'foundation', name: 'Foundation' },
  { value: 'materialize', name: 'Materialize' },
  { value: 'uikit', name: 'UIKit' },
  { value: 'materialUi', name: 'Material-UI' }
];
const packages = {
  fontAwesome: [
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/react-fontawesome'
  ],
  bootstrap: ['bootstrap'],
  uikit: ['uikit', 'uikit-react'],
  foundation: ['foundation-sites'],
  materialize: ['materialize-css'],
  bulma: ['bulma'],
  materialUi: ['@material-ui/core'],
  lintStaged: ['husky', 'lint-staged'],
  redux: ['redux', 'react-redux', 'redux-saga'],
  reduxJest: ['redux-mock-store'],
  core: [
    '@babel/runtime',
    'core-js',
    'normalize-scss',
    'prop-types',
    'react',
    'react-dom',
    'react-router-dom',
    'reselect',
    'classnames'
  ],
  storybook: [
    '@storybook/react',
    '@storybook/addons',
    '@storybook/addon-knobs'
  ],
  esdoc: [
    'esdoc',
    'esdoc-ecmascript-proposal-plugin',
    'esdoc-jsx-plugin',
    'esdoc-standard-plugin'
  ],
  jest: ['babel-jest', 'eslint-plugin-jest', 'jest', 'react-test-renderer'],
  dev: [
    '@babel/core',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-regenerator',
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
    'opener',
    'optimize-css-assets-webpack-plugin',
    'postcss-flexbugs-fixes',
    'postcss-loader',
    'prettier',
    'prettier-eslint',
    'prettier-stylelint',
    'sass-loader',
    'style-loader',
    'stylelint',
    'stylelint-a11y',
    'stylelint-config-recommended',
    'stylelint-webpack-plugin',
    'terser-webpack-plugin',
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
    '.editorconfig',
    'jsconfig.json',
    '.browserslistrc',
    src('utils', 'index.js')
  ],
  templated: [
    '.eslintrc.js',
    'package.json',
    src('index.js'),
    src('index.html'),
    src('index.scss'),
    'webpack.config.babel.js'
  ],
  esdoc: ['.esdoc.json'],
  jest: ['jest.config.js'],
  lintStaged: ['.huskyrc', '.lintstagedrc'],
  fontAwesome: [src('icons.js')]
};
const directories = {
  redux: [src('reducers'), src('sagas'), src('selectors')],
  core: [src('components'), src('utils')]
};
const scripts = {
  esdoc: {
    'build:documentation': 'esdoc',
    'view:documentation': 'opener ./docs/index.html'
  },
  jest: {
    test: 'jest',
    'view:coverage': 'opener ./coverage/index.html'
  }
};

export default class extends Generator {
  constructor(...args) {
    super(...args);

    this.env.adapter.promptModule.registerPrompt(
      'autocomplete',
      require('inquirer-autocomplete-prompt')
    );
    this.sourceRoot(join(__dirname, '..', '..', 'templates', 'app'));

    this.answers = {};
    this.fileSystem = fileSystem(this);
    this.registerTransformStream(
      gulpIf(/\.js$/, prettier(getPrettierConfig()))
    );
    this.registerTransformStream(
      gulpIf(
        /\.scss$/,
        stylelint({
          configFile: join(__dirname, '..', '..', '.stylelintrc')
        })
      )
    );
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
        source: (_, input) => {
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
        message: 'Force linting before commits?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addFontAwesome',
        message: 'Add Font Awesome?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addRedux',
        message: 'Add Redux?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addJest',
        message: 'Add Jest?',
        default: true
      },
      {
        type: 'confirm',
        name: 'flags.addStorybook',
        message: 'Add Storybook?',
        default: false
      },
      {
        type: 'confirm',
        name: 'flags.addESDoc',
        message: 'Add ESDoc?',
        default: false
      }
    ]);
  }

  async writing() {
    const {
      flags,
      package: { license },
      author: { name, email }
    } = this.answers;

    let licenseText = 'Place your license here.\n';

    if (license !== 'SEE LICENSE IN LICENSE') {
      this.log(`Downloading ${license} license from spdx/license-list-data...`);
      const rawLicense = await request(
        `https://raw.githubusercontent.com/spdx/license-list-data/master/text/${license}.txt`
      );

      licenseText = rawLicense
        .replace('<year>', format(new Date(), 'yyyy'))
        .replace('<copyright holders>', `${name} <${email}>`);
    }
    this.fileSystem.createFile('LICENSE', licenseText);

    // copy files and directories
    files.core.forEach(this.fileSystem.copy);
    files.templated.forEach(this.fileSystem.copyTemplateInPlace);
    directories.core.forEach(this.fileSystem.copyDirectory);

    if (flags.addRedux) {
      directories.redux.forEach(this.fileSystem.copyDirectory);
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
      files.esdoc.forEach(this.fileSystem.copy);
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

    if (flags.addFontAwesome) {
      files.fontAwesome.forEach(this.fileSystem.copy);
    }
  }

  install() {
    const main = [];
    const dev = [];
    const { flags, styleFramework } = this.answers;

    this.log('Building a list of packages to install');

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

    if (flags.addRedux && flags.addJest) {
      dev.push.apply(dev, packages.reduxJest);
    }

    if (flags.addStorybook) {
      dev.push.apply(dev, packages.storybook);
    }

    if (flags.addESDoc) {
      main.push.apply(main, packages.esdoc);
    }

    this.log(
      `Getting ready to install ${main.length} dependencies and ${dev.length} dev dependencies.`
    );
    this.npmInstall(main, { save: true });
    this.npmInstall(dev, { 'save-dev': true });
  }
}
