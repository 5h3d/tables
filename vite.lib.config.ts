import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Build of the published package. The demo is built by `vite.config.ts`. */
export default defineConfig({
  plugins: [
    react(),
  ],
  publicDir: false,
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // `tsc -p tsconfig.lib.json` writes dist/types first
    sourcemap: true,
    lib: { entry: path.resolve(import.meta.dirname, 'src/index.ts'), formats: ['es'], fileName: () => 'index.js' },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@tanstack/react-table', 'clsx', 'tailwind-merge', 'class-variance-authority'],
      output: {
        // The components use hooks and browser APIs, so they are client-only.
        banner: "'use client';",
      },
    },
  },
})
