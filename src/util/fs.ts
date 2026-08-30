import { join } from 'path';
import { mkdirp } from 'mkdirp';
import { fileURLToPath } from 'url';

import { CustomGenerator, FS } from '../types';

const __dirname = fileURLToPath(import.meta.url);

export default (gen: CustomGenerator): FS => ({
  copy: (file: string) =>
    gen.fs.copy(gen.templatePath(file), gen.destinationPath(file)),
  copyTo: (src: string, dst: string) =>
    gen.fs.copy(gen.templatePath(src), gen.destinationPath(dst)),
  copyDirectory: (dir: string) =>
    gen.fs.copyTpl(
      gen.templatePath(`${dir}/**/*`),
      gen.destinationPath(dir),
      gen.answers
    ),
  copyTemplate: (source: string, destination: string) =>
    gen.fs.copyTpl(
      gen.templatePath(source),
      gen.destinationPath(destination),
      gen.answers
    ),
  copyTemplateInPlace: (file: string) =>
    gen.fs.copyTpl(
      gen.templatePath(file),
      gen.destinationPath(file),
      gen.answers
    ),
  createFile: (file: string, contents: string | Buffer) =>
    gen.fs.write(gen.destinationPath(file), contents),
  makeDirectory: mkdirp,
  resolve: (...paths: string[]) => join(__dirname, '..', '..', '..', ...paths)
});
