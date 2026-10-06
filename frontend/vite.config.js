import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config: React plugin + dev server proxy so frontend calls to /api
// during local development get forwarded to the backend on port 5000
// without hitting CORS issues.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3308,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

