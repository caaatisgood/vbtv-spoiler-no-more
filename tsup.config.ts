import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['content.ts'],
  outDir: 'dist',
  minify: process.env.NODE_ENV === 'production',
  target: 'es2015',
  sourcemap: process.env.NODE_ENV === 'development',
  define: {
    __DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  platform: 'browser',
  treeshake: true,
});
