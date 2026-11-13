import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Use absolute paths — required for S3 static hosting at bucket root
  // If hosting in a subfolder (e.g. s3://bucket/app/), set this to '/app/'
  base: '/',

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Increase chunk-size warning threshold (openai SDK is large but expected)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor bundles for better caching
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor'
          }
          if (id.includes('node_modules/openai')) {
            return 'openai'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }
        },
      },
    },
  },
})
