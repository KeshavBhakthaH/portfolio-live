import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '01-design': resolve(__dirname, '01-design.html'),
        '0104-design': resolve(__dirname, '0104-design.html'),
        'about-body': resolve(__dirname, 'about-body.html'),
        'about-design': resolve(__dirname, 'about-design.html'),
        'connect-design': resolve(__dirname, 'connect-design.html'),
        'figma-testimonial': resolve(__dirname, 'figma-testimonial.html'),
        'services-design': resolve(__dirname, 'services-design.html'),
        'services2-design': resolve(__dirname, 'services2-design.html'),
        'testimonial-design': resolve(__dirname, 'testimonial-design.html'),
      },
    },
  },
});
