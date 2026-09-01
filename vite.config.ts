import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Lets local `npm run dev` keep using the relative '/api' paths already
    // written in src/api/client.ts, by forwarding them to the FastAPI backend
    // running on PORT=5000 (see backend/app/config.py). Not used in production —
    // the deployed frontend talks to the backend via VITE_API_BASE_URL instead.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
