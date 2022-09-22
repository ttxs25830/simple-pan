import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from "@rollup/plugin-json"

const extensions = ['.ts', '.tsx', '.json'];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
  ],
  plugins: [
    typescript(),
    json(),
    nodeResolve(),
    commonjs(),
  ],
};
