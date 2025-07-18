import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import tailwind from 'tailwindcss';
import { defineConfig } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools';

const BASE_PATH = '/';

export default defineConfig(({ mode }) => {
  return {
    base: BASE_PATH,
    plugins: [vue(), VueDevTools()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    // Update the envPrefix to include APP_ since this was sample .env provided
    envPrefix: ['APP_', 'VITE_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()]
      }
    },
    server: {
      host: true,
      proxy: {
        // if your API lives at http://localhost:8080/api/...
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, '')
        }
      }
    }
  };
});
