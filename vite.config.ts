import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      timeout: 30000
    },
    proxy: {
      '/api/proxy/twincn': {
        target: 'https://p.twincn.com/item.aspx',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/twincn/, ''),
        headers: {
          'Origin': 'https://p.twincn.com/item.aspx',
          'Referer': 'https://p.twincn.com/item.aspx/'
        }
      }
    }
  }
});