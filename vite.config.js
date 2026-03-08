import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambia 'predator-sheet' por el nombre exacto de tu repo de GitHub
export default defineConfig({
  plugins: [react()],
  base: '/predator_reactive_sheet/',
})
