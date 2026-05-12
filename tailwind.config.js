import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const baseConfig = require('../packages/ui/tailwind.config.js')

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig.default ?? baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../packages/ui/src/**/*.{ts,tsx}',
  ],
}
