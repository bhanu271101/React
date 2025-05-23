import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    historyApiFallback: true,
    allowedHosts: ['7804-2409-40f2-204c-9c76-142-96d3-99da-c7a2.ngrok-free.app'],
    // Optional: For HMR to work over ngrok, add the following if you use HTTPS
    hmr: {
      clientPort: 443, // or 80 if you use HTTP tunnel
    },
  },
});
