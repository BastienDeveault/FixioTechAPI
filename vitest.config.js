import { defineConfig } from 'vite';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config.js';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./frontend/src/setupTests.js'],
    include: ['frontend/src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  }
}));