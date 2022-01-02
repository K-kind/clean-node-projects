import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import packageJson from './package.json';

const globals = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

export default {
  input: 'src/cli.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs'
    }
  ],
  plugins: [terser(), typescript()],
  external: Object.keys(globals)
};
