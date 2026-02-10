import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Only proxy actual API requests, not module files
        bypass(req) {
          // Don't proxy requests for TypeScript/JavaScript module files
          if (req.url && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(req.url)) {
            return req.url;
          }
        },
      },
    },
  },
});
