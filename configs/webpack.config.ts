import * as path from 'path';
import { Configuration } from 'webpack';
import tsconfig from '../tsconfig.json';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const initConfig = (): Configuration => {
  const { compilerOptions } = tsconfig;
  const projectDir = path.resolve(__dirname, '..');
  const srcDir = path.resolve(projectDir, compilerOptions.baseUrl);
  const outDir = path.resolve(projectDir, compilerOptions.outDir);
  const distPath = path.resolve(outDir, 'dist');

  return {
    mode: 'production',
    entry: path.resolve(srcDir, 'index.ts'),
    output: {
      filename: 'index.min.js',
      path: distPath,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3,
                },
              ],
              [
                '@babel/preset-typescript',
                {
                  transpileOnly: true,
                  configFile: path.resolve(__dirname, 'tsconfig.dist.json'),
                },
              ],
            ],
            plugins: ['@babel/plugin-transform-runtime'],
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
