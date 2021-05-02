// vite.config.js

//uses npm vite-tsconfig-paths to align bare module behavior to TS
import {defineConfig} from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  mode: "production"
})

