import Generator, {
  type BaseFeatures,
  type BaseOptions
} from 'yeoman-generator';

import fileSystem from './fs.js';
import { CustomGenerator, FS, ModuleAnswers } from '../types/index.js';

export default abstract class BaseGenerator
  extends Generator
  implements CustomGenerator
{
  answers: ModuleAnswers;
  fileSystem: FS;

  // must be a method rather than a field - subclass field initializers do not
  // run until after super() returns, but the prototype is already in place
  protected abstract templateDirectory(): string;

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
