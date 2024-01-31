import { defineConfig } from 'tsup'
import config from './package.json'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  name: config.name,
  target: ['es2015'],
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  esbuildOptions(options, _context) {
    options.drop = [...(options.drop ?? []), 'console']
  },
})
