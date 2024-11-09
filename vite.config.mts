import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { crx } from '@crxjs/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    solidPlugin(),
    viteStaticCopy({
      targets: [
        { src: 'src/styles.css', dest: '' },
      ],
    }),
    crx({ manifest }),
  ],
  server: {
    port: 3000,
  },
  define: {
    __DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  build: {
    target: 'esnext',
    minify: false,
  },
});
