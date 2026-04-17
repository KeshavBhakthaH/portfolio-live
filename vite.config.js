import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        '01-design': '01-design.html',
        '0104-design': '0104-design.html',
        'about-design': 'about-design.html',
        'connect-design': 'connect-design.html',
        'figma-testimonial': 'figma-testimonial.html',
        'services-design': 'services-design.html',
        'services2-design': 'services2-design.html',
        'testimonial-design': 'testimonial-design.html',
      },
    },
  },
});
