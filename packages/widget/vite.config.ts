import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import mix from 'vite-plugin-mix';
import 'dotenv/config';

export default defineConfig({
  define: {
    'process.env': process.env,
    global: 'window'
  },
  plugins: [
    react(),
    svgr(),
    ...(process.env.IS_DEV
      ? [
          // hack the module export problem
          ((mix as any).default as typeof mix)({
            handler: resolve(__dirname, 'src/urls.ts')
          })
        ]
      : [])
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'widget',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@rainbow-me/rainbowkit', ''],
      input: resolve(__dirname, 'src/index.ts'),
      output: {
        // inlineDynamicImports: true,
        format: 'es',
        globals: {
          react: 'React',
          'react-dom': 'React-dom'
        }
      }
    }
  }
});
