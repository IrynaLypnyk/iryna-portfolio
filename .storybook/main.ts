import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/storybook/**/*.stories.@(ts|tsx)', '../src/app/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/nextjs',
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Handle SVG files via @svgr/webpack — mirrors next.config.ts
    const fileLoaderRule = config.module?.rules?.find((rule) => {
      if (typeof rule === 'object' && rule !== null && 'test' in rule) {
        return (rule as { test: RegExp }).test?.toString().includes('svg');
      }
      return false;
    });
    if (fileLoaderRule && typeof fileLoaderRule === 'object') {
      (fileLoaderRule as { exclude: RegExp }).exclude = /\.svg$/;
    }
    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default config;
