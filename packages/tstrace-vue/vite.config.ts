import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// Deployment base path:
//   - dev server (yarn dev): '/', so http://localhost:5173/ works directly
//   - GitHub Pages (yarn build): '/tsTRACE/', the repo-name subpath
//   - root-hosted deploys (Netlify, a custom domain): set BASE_PATH=/
export default defineConfig(({ command }) => ({
  base: process.env.BASE_PATH ?? (command === 'build' ? '/tsTRACE/' : '/'),
  plugins: [vue()],
}))
