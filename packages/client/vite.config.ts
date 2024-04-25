import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import sass from 'sass';
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    react(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    eslintPlugin({ fix: true, include: '**/*.+(cjs|ts|tsx)' }),
    // eslint-disable-next-line new-cap
    TanStackRouterVite(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  define: {
    DEVTOOLS_TANSTACK_QUERY: true,
    DEVTOOLS_TANSTACK_ROUTE: true,
  },
});
