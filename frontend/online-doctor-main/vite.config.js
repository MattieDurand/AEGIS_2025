import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'public'),  // use absolute path
  build: {
    outDir: resolve(__dirname, 'dist'), // keep dist inside online-doctor-main
    emptyOutDir: true
  },
  publicDir: resolve(__dirname, 'public/assets') // optional: if you keep extra static files
})

