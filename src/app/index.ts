import { got } from 'got';
import { join } from 'path';
import gulpIf from 'gulp-if';
import { format } from 'date-fns';
import prettier from 'gulp-prettier';
import { readFileSync } from 'jsonfile';
import stylelint from 'yeoman-stylelint';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import spdxIdentifiers from 'spdx-license-ids' with { type: 'json' };
import Generator, { GeneratorOptions } from 'yeoman-generator';

import fileSystem from '../util/fs';
import { CustomGenerator, FS, ModuleAnswers } from '../types';

spdxIdentifiers.push('SEE LICENSE IN LICENSE');
spdxIdentifiers.sort();

const src = (...paths: string[]) => join('src', ...paths);

const styleFrameworks = [
  { value: null, name: 'None' },
  { value: 'bootstrap', name: 'Bootstrap' },
  { value: 'bulma', name: 'Bulma' },
  { value: 'foundation', name: 'Foundation' },
  { value: 'materialize', name: 'Materialize' },
  { value: 'uikit', name: 'UIKit' },
  { value: 'materialUi', name: 'Material-UI' }
];
const packages: Record<string, string[]> = {
  fontAwesome: [
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/react-fontawesome'
  ],
  bootstrap: ['bootstrap', 'react-bootstrap'],
  uikit: ['uikit', 'uikit-react'],
  foundation: ['foundation-sites'],
  materialize: ['materialize-css'],
  bulma: ['bulma'],
  materialUi: ['@material-ui/core'],
  lintStaged: ['husky', 'lint-staged'],
  redux: ['redux', 'react-redux', 'redux-saga'],
  reduxJest: ['redux-mock-store'],
  rtl: ['@testing-library/react', '@testing-library/dom'],
  core: [
    'normalize-scss',
    'react',
    'react-dom',
    'react-router-dom@6',
    'reselect',
    'classnames'
  ],
  storybook: [
    '@storybook/react',
    '@storybook/builder-webpack5',
    '@storybook/manager-webpack5'
  ],
  esdoc: [
    'esdoc',
    'esdoc-ecmascript-proposal-plugin',
    'esdoc-jsx-plugin',
    'esdoc-standard-plugin',
    'opener'
  ],
  jest: ['eslint-plugin-jest', 'jest', 'react-test-renderer', 'opener'],
  dev: [
    '@eslint/js@9',
    '@types/react',
    '@types/react-dom',
    'autoprefixer',
    'clean-webpack-plugin',
    'cross-env',
    'css-loader',
    'css-minimizer-webpack-plugin',
    'eslint-config-prettier',
    'eslint-import-resolver-webpack',
    'eslint-plugin-import-x',
    'eslint-plugin-prettier',
    'eslint-plugin-react-hooks',
    'eslint-plugin-react',
    'eslint-webpack-plugin',
    'eslint@9',
    'globals',
    'html-loader',
    'html-webpack-plugin',
    'mini-css-extract-plugin',
    'postcss-flexbugs-fixes',
    'postcss-loader',
    'postcss-scss',
    'prettier',
    'sass-loader',
    'sass',
    'style-loader',
    'stylelint-config-recommended',
    'stylelint-webpack-plugin',
    'stylelint',
    'terser-webpack-plugin',
    'typescript@6',
    'typescript-eslint',
    'webpack-cli',
    'webpack',
    'webpack-dev-server'
  ]
};
const files = {
  core: [
    '.prettierrc',
    '.stylelintrc',
    '.editorconfig',
    'tsconfig.json',
    '.browserslistrc',
    src('utils', 'index.js')
  ],
  templated: [
    '.eslintrc.js',
    src('index.js'),
    src('index.html'),
    src('index.scss'),
    'webpack.config.ts'
  ],
  esdoc: ['.esdoc.json'],
  jest: ['jest.config.js'],
  lintStaged: ['.lintstagedrc']
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

export default class extends Generator implements CustomGenerator {
  answers: ModuleAnswers;
  fileSystem: FS;

  constructor(args: string[], options: GeneratorOptions) {
    super(args, options);

    this.env.adapter.promptModule.registerPrompt(
      'autocomplete',
      inquirerPrompt
    );

    this.answers = {
      component: {},
      module: {},
      package: {},
      author: {},
      flags: {}
    };
    this.fileSystem = fileSystem(this);
    this.sourceRoot(this.fileSystem.resolve('templates', 'app'));
    this.registerTransformStream(
      gulpIf(
        /\.js$/,
        prettier(readFileSync(this.fileSystem.resolve('.prettierrc')))
      )
    );
    this.registerTransformStream(
      gulpIf(
        /\.scss$/,
        stylelint({
          configFile: this.fileSystem.resolve('.stylelintrc')
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
        default: this.appname.replace(/\s+/g, '-')
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
        source: (_: unknown, input: string) => {
          const pattern = new RegExp(`.*${input}.*`, 'i');

          return new Promise((resolve) => {
            resolve(
              spdxIdentifiers.filter((identifier) => pattern.test(identifier))
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
      const { body: rawLicense } = await got(
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
    this.fileSystem.copyTemplate('_package.json', 'package.json');
    this.fileSystem.copyTemplate('_eslint.config.mjs', 'eslint.config.mjs');

    // this is a workaround for npm not packaging up .gitignore files
    this.fileSystem.copyTo('gitignore', '.gitignore');

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
  }

  install() {
    const main: string[] = [];
    const dev: string[] = [];
    const { flags, styleFramework } = this.answers;

    this.log('Building a list of packages to install');

    main.push(...packages.core);
    dev.push(...packages.dev);

    if (styleFramework !== undefined) {
      main.push(...packages[styleFramework]);
    }

    if (flags.addLintStaged) {
      dev.push(...packages.lintStaged);
    }

    if (flags.addFontAwesome) {
      main.push(...packages.fontAwesome);
    }

    if (flags.addRedux) {
      main.push(...packages.redux);
    }

    if (flags.addJest) {
      dev.push(...packages.jest);
    }

    if (flags.addRedux && flags.addJest) {
      dev.push(...packages.reduxJest);
    }

    if (flags.addStorybook) {
      dev.push(...packages.storybook);
    }

    if (flags.addESDoc) {
      main.push(...packages.esdoc);
    }

    this.log(
      `Getting ready to install ${main.length} dependencies and ${dev.length} dev dependencies.`
    );
    this.log(`Dependencies: ${main.join(' ')}
Dev dependencies: ${dev.join(' ')}`);
    this.yarnInstall(main);
    this.yarnInstall(dev, { dev: true });
    this.spawnCommandSync('git', ['init']);
    this.spawnCommandSync('npx', ['husky', 'init']);
    this.spawnCommandSync('bash', [
      '-c',
      'echo "npx lint-staged" > .husky/pre-commit'
    ]);
  }
}
