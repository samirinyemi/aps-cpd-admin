import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path:
// - Vercel builds serve at the root of the assigned domain. Vercel sets
//   the `VERCEL` env var at build time, so use '/' there.
// - GitHub Pages serves this project under /aps-cpd-admin/, so keep that
//   subpath for the default (GitHub Pages) build.
const base = process.env.VERCEL ? '/' : '/aps-cpd-admin/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  server: {
    port: 3000,
  },
})
