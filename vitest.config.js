import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.js: that config sets root to apps/web,
// which would hide the specs living next to the code in src/core/.
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.js']
    }
})
