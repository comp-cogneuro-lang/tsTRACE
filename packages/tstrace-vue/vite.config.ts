import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// Production builds (yarn build) use /tsTRACE/ for GitHub Pages.
// Dev server (yarn dev) uses / so http://localhost:5173/ works directly.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tsTRACE/' : '/',
  plugins: [vue()],
}))
