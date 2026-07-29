/**
 * Web implementation of the platform interface.
 *
 * The interface, implemented once here and again in extension.js:
 *
 *   loadState()            -> Promise<{ alarms, theme }>
 *   saveState(state)       -> Promise<void>
 *   requestPermission()    -> Promise<boolean>
 *   notify({ title, body })-> void
 *   unlockAudio()          -> void    (must be called from a user gesture)
 *   playAlarm()            -> void
 *   stopAlarm()            -> void
 *   createTicker(onTick)   -> { start, stop }
 *
 * UI components talk only to this interface. Nothing in src/ui/ may reach for
 * localStorage, Notification, Audio or chrome.* directly.
 */

import { isValidTheme, defaultTheme } from '@/core/themes.js'

const STORAGE_KEY = 'alarm-clock:state'
const ALARM_SOUND = '/sounds/alarm-clock.mp3'

export function createWebPlatform() {
    let audio = null

    function element() {
        if (!audio) {
            audio = new Audio(ALARM_SOUND)
            audio.loop = true
            audio.preload = 'auto'
        }

        return audio
    }

    return {
        async loadState() {
            const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true

            let stored = null
            try {
                stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
            } catch {
                // Corrupt or unavailable storage is not worth failing over.
            }

            return {
                alarms: Array.isArray(stored?.alarms) ? stored.alarms : [],
                theme: isValidTheme(stored?.theme) ? stored.theme : defaultTheme(prefersDark)
            }
        },

        async saveState(state) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
            } catch {
                // Private mode / quota. The clock still works for this session.
            }
        },

        async requestPermission() {
            if (!('Notification' in window)) return false
            if (Notification.permission === 'granted') return true
            if (Notification.permission === 'denied') return false

            return (await Notification.requestPermission()) === 'granted'
        },

        notify({ title, body }) {
            if (!('Notification' in window) || Notification.permission !== 'granted') return

            // The whole point: this escapes a hidden tab, where the on-page
            // overlay would never be seen.
            new Notification(title, { body, icon: '/android-chrome-192x192.png' })
        },

        unlockAudio() {
            // Autoplay policy blocks a bare play() later on. Starting and
            // immediately pausing during a real click marks the element as
            // user-activated, so the alarm can sound unattended afterwards.
            const sound = element()

            sound
                .play()
                .then(() => {
                    sound.pause()
                    sound.currentTime = 0
                })
                .catch(() => {})
        },

        playAlarm() {
            const sound = element()

            sound.currentTime = 0
            sound.loop = true
            sound.play().catch(() => {})
        },

        stopAlarm() {
            const sound = element()

            sound.pause()
            // The old stopAlarm() skipped this, so the next ring resumed from
            // wherever the previous one was silenced.
            sound.currentTime = 0
        },

        createTicker(onTick) {
            let worker = null
            let fallback = null

            return {
                start() {
                    try {
                        worker = new Worker(new URL('../workers/ticker.js', import.meta.url), {
                            type: 'module'
                        })
                        worker.onmessage = () => onTick()
                        worker.postMessage('start')
                    } catch {
                        // No worker support: a throttled main-thread timer is
                        // still correct, just coarser.
                        fallback = setInterval(onTick, 250)
                    }
                },

                stop() {
                    worker?.postMessage('stop')
                    worker?.terminate()
                    worker = null
                    clearInterval(fallback)
                    fallback = null
                }
            }
        }
    }
}
