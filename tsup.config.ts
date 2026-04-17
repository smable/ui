import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'clsx',
    'lucide-react',
    'date-fns',
    'react-day-picker',
  ],
  treeshake: true,
  splitting: false,
})
