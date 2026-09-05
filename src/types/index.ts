import { mkdirp } from 'mkdirp';
import Generator from 'yeoman-generator';

export interface FS {
  copy: (file: string) => void;
  copyTo: (source: string, destination: string) => void;
  copyDirectory: (directory: string) => void;
  copyTemplate: (source: string, destination: string) => void;
  copyTemplateInPlace: (file: string) => void;
  createFile: (file: string, contents: string | Buffer) => void;
  makeDirectory: typeof mkdirp;
  resolve: (...paths: string[]) => string;
}

// an edit either rewrites the file, finds its work already done, or does not
// recognize the shape it was pointed at - only the last one is worth warning about
export type SourceEditStatus = 'updated' | 'unchanged' | 'unrecognized';

export type SourceEdit =
  | { status: 'updated'; contents: string }
  | { status: 'unchanged' | 'unrecognized' };

export type ModuleAnswers = {
  directoryMode?: string;
  styleFramework?: string;
  testFramework?: string;
  component: {
    name?: string;
  };
  deploy: {
    domain?: string;
  };
  module: {
    name?: string;
  };
  package: {
    license?: string;
  };
  page: {
    name?: string;
    url?: string;
  };
  author: {
    name?: string;
    email?: string;
  };
  flags: Flags;
};

export type Flags = {
  addCnamePlugin?: boolean;
  addEsDoc?: boolean;
  addFontAwesome?: boolean;
  addLintStaged?: boolean;
  addRedux?: boolean;
  addSaga?: boolean;
  addStorybook?: boolean;
  addTest?: boolean;
  createSaga?: boolean;
  createSelector?: boolean;
  createReducer?: boolean;
};

export type CustomGenerator = Generator & {
  answers: ModuleAnswers;
  fileSystem: FS;
};

export enum StyleFrameworks {
  None = '',
  Bootstrap = 'bootstrap',
  Bulma = 'bulma',
  Foundation = 'foundation',
  Materialize = 'materialize',
  UIkit = 'uikit',
  MaterialUI = 'materialUi'
}

export enum TestFrameworks {
  None = '',
  Jest = 'jest',
  ReactTestingLibrary = 'rtl'
}

export type FrameworkChoice = {
  name: string;
  value: string;
};
