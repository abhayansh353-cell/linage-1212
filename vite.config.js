// This file redirects vite build to use Next.js build instead
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['next'],
      output: {
        dir: 'out'
      }
    }
  },
  plugins: [
    {
      name: 'nextjs-redirect',
      buildStart() {
        console.log('This is a Next.js project. Please use "npm run build" instead of "npx vite build"')
        process.exit(1)
      }
    }
  ]
})