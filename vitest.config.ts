import { defineConfig } from 'vitest/config'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  test: {
    benchmark: {
      include: ['test/**/*.bench.(js|ts)'],
    },
  },
  resolve: {
    alias: [{ find: '~', replacement: `${__dirname}/src` }],
  },
})
