import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    // Pure-function tests, cepat — jalankan berurutan untuk menghindari race
    // startup worker pool Vitest 4 (kadang gagal "reading 'config'" saat paralel).
    fileParallelism: false,
  },
})
