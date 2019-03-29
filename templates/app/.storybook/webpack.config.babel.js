import webpack from '../webpack.config.babel';

export default async ({ config }) => ({
  ...config,
  module: webpack.module,
  resolve: webpack.resolve
});
