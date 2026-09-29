import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],

  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ReactTreeCanvas',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') {
          return 'react-tree-canvas.js';
        }

        return 'react-tree-canvas.cjs';
      },
    },

    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
