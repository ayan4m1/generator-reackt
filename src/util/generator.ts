import Generator, {
  type BaseFeatures,
  type BaseOptions
} from 'yeoman-generator';

import fileSystem from './fs';
import { CustomGenerator, FS, ModuleAnswers, SourceEdit } from '../types';

export default abstract class BaseGenerator
  extends Generator
  implements CustomGenerator
{
  answers: ModuleAnswers;
  fileSystem: FS;

  // must be a method rather than a field - subclass field initializers do not
  // run until after super() returns, but the prototype is already in place
  protected abstract templateDirectory(): string;

  // both generators reach into an already-generated project the same way: read
  // the file if it is there, apply an edit that may not recognize it, write back
  // only when something actually changed
  protected editSource(
    path: string,
    label: string,
    edit: (contents: string) => SourceEdit
  ) {
    const filePath = this.destinationPath(path);

    if (!this.fs.exists(filePath)) {
      this.log(`WARNING: ${path} is missing, skipping ${label}`);
      return;
    }

    const result = edit(this.fs.read(filePath));

    switch (result.status) {
      case 'updated':
        this.fs.write(filePath, result.contents);
        break;
      case 'unrecognized':
        this.log(`WARNING: could not find ${label} in ${path}, skipping it`);
        break;
    }
  }

  constructor(args: string[], options: BaseOptions, features?: BaseFeatures) {
    super(args, options, features);

    this.answers = {
      component: {},
      deploy: {},
      module: {},
      package: {},
      page: {},
      author: {},
      flags: {}
    };
    this.fileSystem = fileSystem(this);
    this.sourceRoot(
      this.fileSystem.resolve('templates', this.templateDirectory())
    );
  }
}
