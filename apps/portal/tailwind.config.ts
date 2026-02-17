import type { Config } from 'tailwindcss';
// Prefer importing the UI package export (ensure this package exports the config)
import baseConfig from '@trycompai/ui/tailwind.config';

export default {
  presets: [baseConfig],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/invoice/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
