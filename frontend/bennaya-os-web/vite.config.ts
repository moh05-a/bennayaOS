import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind v4 runs as a Vite plugin. No tailwind.config.js and no
    // postcss.config.js are needed - it scans your source files automatically.
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
})
