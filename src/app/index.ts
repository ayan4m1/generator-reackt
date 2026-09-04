import { join } from 'path';
import gulpIf from 'gulp-if';
import { format } from 'date-fns';
import prettier from 'gulp-prettier';
import { readFileSync } from 'jsonfile';
import stylelint from 'yeoman-stylelint';
import spdxIdentifiers from 'spdx-license-ids' with { type: 'json' };
import Generator, {
  type BaseFeatures,
  type BaseOptions
} from 'yeoman-generator';

import fileSystem, { src } from '../util/fs';
import { CustomGenerator, FS, ModuleAnswers, StyleFramework } from '../types';

spdxIdentifiers.push('SEE LICENSE IN LICENSE');
spdxIdentifiers.sort();

// addDependencies pins exact versions, so restore the caret ranges that
// yarn add used to write
const caretRange = (deps: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(deps).map(([name, version]) => [
      name,
      /^\d/.test(version) ? `^${version}` : version
    ])
  );

const styleFrameworks: StyleFramework[] = [
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
  bootstrap: ['bootstrap', 'react-bootstrap', '@popperjs/core'],
  uikit: ['uikit', 'uikit-react'],
  foundation: ['foundation-sites', 'react-foundation'],
  materialize: ['materialize-css', 'react-materialize'],
  bulma: ['bulma'],
  materialUi: ['@mui/material', '@emotion/react', '@emotion/styled'],
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
    'storybook@10',
    '@storybook/react-vite@10',
    '@storybook/addon-docs@10',
    '@storybook/addon-a11y@10',
    '@storybook/addon-links@10',
    '@storybook/addon-themes@10',
    '@vitejs/plugin-react',
    'vite'
  ],
  esdoc: [
    'esdoc',
    'esdoc-ecmascript-proposal-plugin',
    'esdoc-jsx-plugin',
    'esdoc-standard-plugin',
    'opener'
  ],
  jest: [
    '@types/jest',
    'eslint-plugin-jest',
    'jest',
    'react-test-renderer',
    'opener'
  ],
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
    'eslint-import-resolver-typescript',
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
    'postcss',
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
    'ts-loader',
    'typescript@6',
    'typescript-eslint',
    'webpack-cli',
    'webpack',
    'webpack-dev-server'
  ]
};
// react-foundation ships no typings of its own
const styleFrameworkDevPackages: Record<string, string[]> = {
  foundation: ['@types/react-foundation']
};
const files = {
  core: [
    '.yarnrc.yml',
    '.prettierrc',
    '.stylelintrc',
    '.editorconfig',
    'tsconfig.json',
    '.browserslistrc'
  ],
  templated: [src('index.tsx'), src('index.html'), src('utils', 'index.ts')],
  esdoc: ['.esdoc.json'],
  jest: ['jest.config.js'],
  storybook: [join('.storybook', 'main.ts'), join('.storybook', 'preview.ts')],
  lintStaged: ['.lintstagedrc']
};
const directories = {
  redux: [src('reducers'), src('sagas'), src('selectors')],
  templated: [src('components'), src('pages'), src('types')]
};
const scripts = {
  esdoc: {
    'build:documentation': 'esdoc',
    'view:documentation': 'opener ./docs/index.html'
  },
  jest: {
    test: 'jest',
    'view:coverage': 'opener ./coverage/index.html'
  },
  storybook: {
    storybook: 'storybook dev -p 6006',
    'build:storybook': 'storybook build'
  }
};

export default class extends Generator implements CustomGenerator {
  answers: ModuleAnswers;
  fileSystem: FS;

  constructor(args: string[], options: BaseOptions, features?: BaseFeatures) {
    super(args, options, features);

    this.answers = {
      component: {},
      deploy: {},
      module: {},
      package: {},
      author: {},
      flags: {}
    };
    this.fileSystem = fileSystem(this);
    this.sourceRoot(this.fileSystem.resolve('templates', 'app'));
  }

  initializing() {
    // the environment reads this lazily when it drains the install queue, so
    // setting it here is enough to keep yarn as the package manager
    (
      this.env as unknown as { options: { nodePackageManager?: string } }
    ).options.nodePackageManager = 'yarn';
    // disable age gate for initial yarn install
    process.env.YARN_NPM_MINIMAL_AGE_GATE = '0';

    this.queueTransformStream(
      {},
      gulpIf(
        /\.tsx?$/,
        prettier(readFileSync(this.fileSystem.resolve('.prettierrc')))
      ),
      gulpIf(
        /\.scss$/,
        stylelint({
          configFile: this.fileSystem.resolve('.stylelintrc')
        })
      )
    );
  }

  async prompting() {
    const [name, email] = await Promise.all([
      this.git.name(),
      this.git.email()
    ]);

    this.answers = await this.prompt<ModuleAnswers>([
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
        type: 'search',
        name: 'package.license',
        message: 'Package license',
        source: (term: string | undefined) => {
          const pattern = new RegExp(`.*${term ?? ''}.*`, 'i');

          return spdxIdentifiers.filter((identifier) =>
            pattern.test(identifier)
          );
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
        default: name
      },
      {
        type: 'input',
        name: 'author.email',
        message: 'Author email address',
        default: email
      },
      {
        type: 'select',
        name: 'styleFramework',
        message: 'What CSS framework would you like to use?',
        choices: styleFrameworks
      },
      {
        type: 'confirm',
        name: 'flags.addCnamePlugin',
        message: 'Deploying to GitHub Pages with CNAME?',
        default: false
      },
      {
        type: 'input',
        name: 'deploy.domain',
        message: 'Hostname to use',
        when: (answers: ModuleAnswers) => answers.flags.addCnamePlugin
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
        default: false
      },
      {
        type: 'confirm',
        name: 'flags.addJest',
        message: 'Add Jest?',
        default: false
      },
      {
        type: 'confirm',
        name: 'flags.addStorybook',
        message: 'Add Storybook?',
        default: false
      },
      {
        type: 'confirm',
        name: 'flags.addEsDoc',
        message: 'Add ESDoc?',
        default: false
      }
    ]);
  }

  async writing() {
    const {
      flags,
      styleFramework,
      package: { license },
      author: { name, email }
    } = this.answers;

    let licenseText = 'Place your license here.\n';

    if (license !== 'SEE LICENSE IN LICENSE') {
      this.log(`Downloading ${license} license from spdx/license-list-data...`);
      const response = await fetch(
        `https://raw.githubusercontent.com/spdx/license-list-data/master/text/${license}.txt`
      );

      if (response.status !== 200) {
        this.log(
          `License download failed with HTTP ${response.status} - ${response.statusText}`
        );
      } else {
        const rawLicense = await response.text();

        licenseText = rawLicense
          .replace('<year>', format(new Date(), 'yyyy'))
          .replace('<copyright holders>', `${name} <${email}>`);
      }
    }
    this.fileSystem.createFile('LICENSE', licenseText);

    // copy files and directories
    files.core.forEach(this.fileSystem.copy);
    files.templated.forEach(this.fileSystem.copyTemplateInPlace);
    directories.templated.forEach(this.fileSystem.copyDirectory);

    // these are underscored to prevent them being picked up by ESLint
    this.fileSystem.copyTemplate('_package.json', 'package.json');
    this.fileSystem.copyTemplate('_eslint.config.mjs', 'eslint.config.mjs');
    this.fileSystem.copyTemplate('webpack.config.nts', 'webpack.config.ts');
    this.fileSystem.copyTemplate(src('index.nscss'), src('index.scss'));

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

    if (flags.addStorybook) {
      files.storybook.forEach(this.fileSystem.copyTemplateInPlace);
      this.fileSystem.copyTemplate(
        join('_stories', 'SuspenseFallback.stories.tsx'),
        src('components', 'SuspenseFallback.stories.tsx')
      );
      this.fs.append(this.destinationPath('.gitignore'), 'storybook-static/');
      this.fs.extendJSON(this.destinationPath('package.json'), {
        scripts: {
          ...scripts.storybook
        }
      });
    }

    if (flags.addEsDoc) {
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
      this.fileSystem.createFile('.husky/pre-commit', 'npx lint-staged\n');
    }

    const main: string[] = [...packages.core];
    const dev: string[] = [...packages.dev];

    // the "None" choice carries a null value, so a truthy check is what skips it
    if (styleFramework) {
      main.push(...packages[styleFramework]);

      if (styleFrameworkDevPackages[styleFramework]) {
        dev.push(...styleFrameworkDevPackages[styleFramework]);
      }
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

    if (flags.addEsDoc) {
      main.push(...packages.esdoc);
    }

    this.log(
      `Resolving ${main.length} dependencies and ${dev.length} dev dependencies.`
    );

    const [dependencies, devDependencies] = await Promise.all([
      this.addDependencies(main),
      this.addDevDependencies(dev)
    ]);

    this.packageJson.merge({
      dependencies: caretRange(dependencies),
      devDependencies: caretRange(devDependencies)
    });
  }

  install() {
    // must run before the environment's package manager install task, which is
    // queued lazily once package.json is committed to disk - otherwise yarn
    // installs with the wrong version.
    this.spawnSync('yarn', ['set', 'version', 'stable'], { stdio: 'inherit' });
  }

  async end() {
    const { flags } = this.answers;

    this.spawnSync('git', ['init'], { stdio: 'inherit' });

    if (flags.addLintStaged) {
      this.spawnSync('npx', ['husky'], { stdio: 'inherit' });
    }
  }
}
