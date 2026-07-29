/**
 * Extension implementation of the platform interface.
 *
 * Most of it is deliberately hollow. Audio, notifications and scheduling all
 * belong to the background worker, which keeps running after the popup closes;
 * doing any of it here would tie the alarm's life to a window the user shuts
 * within seconds. The methods remain so App.vue can stay ignorant of which
 * platform it is running on.
 */

import browser from 'webextension-polyfill'
import { isValidTheme, defaultTheme } from '@/core/themes.js'
import { useExtensionAlarms } from '@/composables/useExtensionAlarms.js'

export function createExtensionPlatform() {
    return {
        createAlarms(now) {
            return useExtensionAlarms(now)
        },

        async loadState() {
            const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
            const { theme } = await browser.storage.local.get('theme')

            return {
                alarms: [],
                theme: isValidTheme(theme) ? theme : defaultTheme(prefersDark)
            }
        },

        // The worker owns the alarm list; the popup must not write it back.
        hydrateAlarms() {},
        saveAlarms() {},

        saveTheme(theme) {
            browser.storage.local.set({ theme })
        },

        // Notification permission comes from the manifest, and the worker owns
        // playback — so unlocking audio in the popup would achieve nothing.
        async requestPermission() {
            return true
        },
        notify() {},
        unlockAudio() {},
        playAlarm() {},
        stopAlarm() {},

        createTicker(onTick) {
            // A popup is short-lived and always visible while it exists, so a
            // plain timer is right here — no worker, no throttling to dodge.
            let handle = null

            return {
                start() {
                    handle = setInterval(onTick, 250)
                },
                stop() {
                    clearInterval(handle)
                    handle = null
                }
            }
        }
    }
}
