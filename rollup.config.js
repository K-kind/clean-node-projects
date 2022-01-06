import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import packageJson from './package.json';

const globals = {
  ...packageJson.dependencies
};

export default {
  input: 'src/cli.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs'
    }
  ],
  plugins: [commonjs(), nodeResolve(), terser(), typescript()],
  external: Object.keys(globals)
};
