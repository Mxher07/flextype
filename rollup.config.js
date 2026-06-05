import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const production = process.env.BUILD === 'production'

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/flextype.esm.js', format: 'esm' },
    { file: 'dist/flextype.cjs.js', format: 'cjs', exports: 'auto' },
    { file: 'dist/flextype.umd.js', format: 'umd', name: 'FlexTypeRuntime' }
  ],
  plugins: [
    nodeResolve({ browser: true }),
    commonjs()
  ]
}
