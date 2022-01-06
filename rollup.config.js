import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import packageJson from './package.json';

const isProd = process.env.NODE_ENV === 'production';

const globals = {
  ...packageJson.dependencies
};

const plugins = [
  ...(isProd ? [commonjs(), nodeResolve(), terser()] : []),
  typescript()
];

export default {
  input: 'src/cli.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs'
    }
  ],
  plugins,
  external: Object.keys(globals)
};
