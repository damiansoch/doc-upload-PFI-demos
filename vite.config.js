import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    // Vite only bundles what's listed here — without these, `vite build`
    // silently drops overview.html and chart.html from the output, and a
    // production deploy 404s on them even though `vite dev` serves any
    // .html file directly and never surfaces the gap locally.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        overview: fileURLToPath(new URL('./overview.html', import.meta.url)),
        chart: fileURLToPath(new URL('./chart.html', import.meta.url)),
      },
    },
  },
})
