import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: [
    './src/app/index.ts',
    './src/component/index.ts',
    './src/module/index.ts'
  ],
  output: {
    dir: './generators',
    format: 'esm',
    preserveModules: true
  },
  plugins: [
    autoExternal({
      builtins: true
    }),
    typescript(),
    terser()
  ]
};
