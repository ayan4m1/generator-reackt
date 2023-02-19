import { resolve } from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import autoExternal from 'rollup-plugin-auto-external';
import babel from '@rollup/plugin-babel';
import multiInput from 'rollup-plugin-multi-input';
import eslint from '@rollup/plugin-eslint';

export default {
  input: './src/**/*.js',
  output: {
    dir: './generators/',
    format: 'cjs',
    exports: 'auto'
  },
  plugins: [
    eslint(),
    autoExternal(),
    multiInput.default(),
    nodeResolve(),
    babel({
      babelHelpers: 'runtime',
      configFile: resolve('.babelrc')
    }),
    terser()
  ]
};
