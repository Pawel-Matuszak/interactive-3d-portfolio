import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/interactive-3d-portfolio/',
  plugins: [react()],
})
