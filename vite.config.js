import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    historyApiFallback: true,
    allowedHosts: ['react-2x8o.onrender.com'],
    hmr: {
      clientPort: 443, // or 80 if you use HTTP tunnel
    },
  },
});
