import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Permite servir la versión de producción desde
  // un directorio sin ruta base fija
  base: './',
})
