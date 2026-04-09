import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if the branch being built is 'beta'
const isBeta = process.env.GITHUB_REF_NAME === 'beta'

export default defineConfig({
  plugins: [react()],
  // If it's beta, use the /beta/ subfolder; otherwise, use the root repo path
  base: isBeta 
    ? '/predator_reactive_sheet/beta/' 
    : '/predator_reactive_sheet/',
})
