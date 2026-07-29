import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The web app lives in apps/web/ so that apps/extension/ can sit beside it
// later and share everything in src/. Both reach shared code through '@'.
export default defineConfig({
    root: fileURLToPath(new URL('./apps/web', import.meta.url)),
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: fileURLToPath(new URL('./dist', import.meta.url)),
        emptyOutDir: true
    }
})
