import mkdirp from 'mkdirp';

export default (gen) => ({
  copy: (file) =>
    gen.fs.copy(gen.templatePath(file), gen.destinationPath(file)),
  copyTo: (src, dst) =>
    gen.fs.copy(gen.templatePath(src), gen.destinationPath(dst)),
  copyDirectory: (dir) =>
    gen.fs.copyTpl(
      gen.templatePath(`${dir}/**/*`),
      gen.destinationPath(dir),
      gen.answers
    ),
  copyTemplate: (source, destination) =>
    gen.fs.copyTpl(
      gen.templatePath(source),
      gen.destinationPath(destination),
      gen.answers
    ),
  copyTemplateInPlace: (file) =>
    gen.fs.copyTpl(
      gen.templatePath(file),
      gen.destinationPath(file),
      gen.answers
    ),
  createFile: (file, contents) =>
    gen.fs.write(gen.destinationPath(file), contents),
  makeDirectory: mkdirp
});
