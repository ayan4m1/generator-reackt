import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';

const src = './src/**/*.js';
const dst = './generators/';

const lint = () =>
  gulp
    .src(src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

const compile = () =>
  gulp
    .src(src)
    .pipe(babel())
    .pipe(gulp.dest(dst));

const clean = () => del(dst);
const build = gulp.series(clean, lint, compile);
const watch = () => gulp.watch(src, build);

gulp.task('lint', lint);
gulp.task('clean', clean);
gulp.task('watch', gulp.series(build, watch));
gulp.task('default', build);
