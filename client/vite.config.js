// client/vite.config.js
import { defineConfig } from 'vite';
import react        from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request starting with /api will be forwarded to the API server
      '/api': {
        // use VITE_API_URL or fall back to localhost
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
