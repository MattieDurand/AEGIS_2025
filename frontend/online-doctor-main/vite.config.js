import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',       // 👈 tells Vite index.html is inside /public
  build: {
    outDir: '../dist',  // output into /frontend/online-doctor-main/dist
    emptyOutDir: true
  }
})
