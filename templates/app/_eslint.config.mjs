import globals from 'globals';
import eslint from '@eslint/js';
import { configs } from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { flatConfigs as importConfigs } from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default defineConfig(
  eslint.configs.recommended,
  ...configs.recommended,
  importConfigs.recommended,
  importConfigs.react,
  importConfigs.typescript,
  reactPlugin.configs.flat['recommended'],
  reactHooksPlugin.configs.flat['recommended-latest'],
  {
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      'react/jsx-uses-react': 0,
      'react/jsx-sort-props': 2,
      'react/react-in-jsx-scope': 0
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['webpack.config.*'],
    languageOptions: {
      globals: globals.node
    }
  },
  prettierPlugin
);
