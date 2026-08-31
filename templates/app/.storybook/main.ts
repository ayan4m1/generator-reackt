import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vite';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-themes'
  ],
  // since Storybook 8 the framework no longer injects @vitejs/plugin-react
  viteFinal: (config: StorybookConfig) =>
    mergeConfig(config, { plugins: [react()] })
};

export default config;
