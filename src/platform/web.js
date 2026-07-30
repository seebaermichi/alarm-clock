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

import { isValidTheme, isValidMode, defaultTheme, defaultMode } from '@/core/themes.js'
import { useAlarms } from '@/composables/useAlarms.js'
import { createRinger, hasRecipe } from './sounds.js'

const STORAGE_KEY = 'alarm-clock:state'
const ALARM_SOUND = '/sounds/alarm-clock.mp3'

export function createWebPlatform() {
    let audio = null
    // The alarm sound follows the theme (each design ships its own WebAudio
    // recipe), so the platform tracks the active theme itself — the alarm
    // store that calls playAlarm() has no business knowing about themes.
    let currentTheme = defaultTheme()
    const ringer = createRinger()
    const platform = {}

    function read() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? {}
        } catch {
            return {}
        }
    }

    /** Merge-write, so saving alarms cannot clobber the theme and vice versa. */
    function write(patch) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...patch }))
        } catch {
            // Private mode / quota. The clock still works for this session.
        }
    }

    function element() {
        if (!audio) {
            audio = new Audio(ALARM_SOUND)
            audio.loop = true
            audio.preload = 'auto'
        }

        return audio
    }

    return Object.assign(platform, {
        // The web app fires its own alarms in the page. The extension does not
        // — its background worker owns scheduling — so this factory is part of
        // the platform interface rather than something App.vue decides.
        createAlarms(now) {
            return useAlarms(platform, now)
        },

        async loadState() {
            const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
            const stored = read()

            currentTheme = isValidTheme(stored?.theme) ? stored.theme : defaultTheme()

            return {
                alarms: Array.isArray(stored?.alarms) ? stored.alarms : [],
                theme: currentTheme,
                mode: isValidMode(stored?.mode) ? stored.mode : defaultMode(prefersDark)
            }
        },

        hydrateAlarms(alarmsRef, stored) {
            alarmsRef.value = stored
        },

        saveAlarms(alarms) {
            write({ alarms })
        },

        saveTheme(theme) {
            currentTheme = theme
            write({ theme })
        },

        saveMode(mode) {
            write({ mode })
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
            // The WebAudio context needs the same gesture to leave 'suspended',
            // and the user may switch themes between set and ring — so both
            // paths are unlocked here regardless of the current theme.
            const sound = element()

            sound
                .play()
                .then(() => {
                    sound.pause()
                    sound.currentTime = 0
                })
                .catch(() => {})

            ringer.unlock()
        },

        playAlarm() {
            if (hasRecipe(currentTheme)) {
                ringer.start(currentTheme)
                return
            }

            const sound = element()

            sound.currentTime = 0
            sound.loop = true
            sound.play().catch(() => {})
        },

        stopAlarm() {
            // Stop both paths, not just the current theme's: the theme may
            // have changed while ringing.
            ringer.stop()

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
    })
}
