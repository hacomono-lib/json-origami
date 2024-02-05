import codspeed from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  // @ts-ignore FIXME: cannot fix this error
  plugins: [codspeed()],
  test: {
    benchmark: {
      include: ['test/**/*.bench.(js|ts)'],
    },
  },
  resolve: {
    alias: [{ find: '~', replacement: `${__dirname}/src` }],
  },
})
