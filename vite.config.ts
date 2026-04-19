import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite's default `appType: 'spa'` already serves index.html for any
// unmatched route during `vite dev` and `vite preview`, so deep links
// like /q/<token> work out of the box in local development.
// (The previous `historyApiFallback: true` was a webpack-dev-server
// option and had no effect here.)
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
})
