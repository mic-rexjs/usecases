import * as path from 'path';
import { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const initConfig = (): Configuration => {
  const projectDir = __dirname;
  const srcDir = path.resolve(projectDir, 'src');
  const outDir = path.resolve(projectDir, 'build');
  const distPath = path.resolve(outDir, 'dist');

  return {
    mode: 'production',
    entry: path.resolve(srcDir, 'index.ts'),
    output: {
      filename: 'index.min.js',
      path: distPath,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': srcDir,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
          options: {
            extends: path.resolve(projectDir, '.babelrc'),
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(projectDir, 'package.json'),
            to: path.resolve(outDir, 'package.json'),
            transform(content): string {
              const json = JSON.parse(content.toString());

              json.private = false;
              return JSON.stringify(json, null, 2);
            },
          },
          ...['README.md'].map((filename: string): CopyWebpackPlugin.Pattern => {
            return {
              from: path.resolve(projectDir, filename),
              to: path.resolve(outDir, filename),
            };
          }),
        ],
      }),
    ],
  };
};

export default initConfig();
