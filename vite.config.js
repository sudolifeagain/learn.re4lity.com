import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Markdown rendering
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          // YouTube player
          'vendor-youtube': ['react-youtube'],
        }
      }
    }
  }
})
