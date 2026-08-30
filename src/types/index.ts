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

export type ModuleAnswers = {
  directoryMode?: string;
  styleFramework?: string;
  component: {
    name?: string;
  };
  module: {
    name?: string;
  };
  package: {
    license?: string;
  };
  author: {
    name?: string;
    email?: string;
  };
  flags: Flags;
};

export type Flags = {
  addESDoc?: boolean;
  addFontAwesome?: boolean;
  addJest?: boolean;
  addLintStaged?: boolean;
  addRedux?: boolean;
  addSaga?: boolean;
  addStorybook?: boolean;
  createSelector?: boolean;
  createReducer?: boolean;
};

export type CustomGenerator = Generator & {
  answers: ModuleAnswers;
  fileSystem: FS;
};
