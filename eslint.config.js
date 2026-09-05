import eslint from '@eslint/js';
import { configs as typescriptConfigs } from 'typescript-eslint';
import { flatConfigs as importConfigs } from 'eslint-plugin-import-x';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  {
    ignores: ['templates/**/*', 'generators/**/*']
  },
  eslint.configs.recommended,
  ...typescriptConfigs.recommended,
  importConfigs.recommended,
  importConfigs.typescript,
  eslintPluginPrettier
];
