import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    benchmark: {
      include: ['test/**/*.bench.(js|ts)']
    }
  },
})
