import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import webExtension from 'vite-plugin-web-extension'
import manifest from './apps/extension/manifest.js'

// TARGET_BROWSER picks the manifest variant; see apps/extension/manifest.js for
// what actually differs between Chrome and Firefox.
const target = process.env.TARGET_BROWSER ?? 'chrome'

const extensionRoot = fileURLToPath(new URL('./apps/extension', import.meta.url))
const outDir = fileURLToPath(new URL(`./dist-extension/${target}`, import.meta.url))

/**
 * The plugin runs separate nested Vite builds for HTML pages and for scripts.
 * Those builds do not inherit this file's plugins, aliases, root or outDir —
 * each has to be handed over explicitly, or '@/...' fails to resolve, the
 * background entry is not found, and the outputs land in the wrong directory.
 *
 * Paths are absolute deliberately: the two nested builds resolve relative
 * paths against different roots.
 *
 * Note also that the web app's config is named vite.config.web.js rather than
 * the default vite.config.js. Vite would auto-discover the default name during
 * these nested builds and apply the web app's root, breaking every entry path.
 */
const nested = {
    root: extensionRoot,
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    plugins: [vue()],
    build: {
        outDir,
        // Two nested builds write here in sequence; emptying would delete
        // whichever finished first.
        emptyOutDir: false
    }
}

export default defineConfig({
    root: extensionRoot,
    // Icons and the alarm sound come from the same place the web app uses.
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    plugins: [
        webExtension({
            manifest: () => manifest(target),
            browser: target,
            // The offscreen document is created at runtime by the worker, so
            // nothing in the manifest points at it and it needs declaring.
            additionalInputs: ['offscreen.html'],
            // web-ext auto-launch is unused; it only exists to drive a browser
            // runner we have no need for.
            disableAutoLaunch: true,
            htmlViteConfig: nested,
            scriptViteConfig: nested
        })
    ],
    build: {
        outDir,
        emptyOutDir: true
    }
})
