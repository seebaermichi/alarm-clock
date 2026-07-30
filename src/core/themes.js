/**
 * Theme identities. The colours themselves live in styles/themes.scss as CSS
 * custom properties under :root[data-theme="…"][data-mode="…"] — this module
 * only names them, so the picker and the persistence layer agree on the set.
 *
 * Two axes since the redesign (design/README.md): `theme` picks a clock face
 * (structure, not just colours), `mode` picks its dark or light variant.
 */

import { DEFAULT_SNOOZE_MINUTES } from './alarm.js'

export const THEMES = [
    { id: 'basic', label: 'Basic', hint: 'The original LCD clock', kind: 'digital' },
    { id: 'split-flap', label: 'Split-Flap', hint: 'Departure-board flip cards', kind: 'digital' },
    { id: 'retro-led', label: 'Retro LED', hint: 'Bedside clock radio', kind: 'digital' },
    { id: 'terminal', label: 'Terminal', hint: 'Keyboard-first console', kind: 'digital' },
    { id: 'station', label: 'Station', hint: 'Railway platform dial', kind: 'analog' },
    { id: 'nocturne', label: 'Nocturne', hint: 'Luminous night dial', kind: 'analog' },
    { id: 'riviera', label: 'Riviera', hint: 'Mid-century shapes', kind: 'analog' }
]

export const MODES = ['dark', 'light']

export const DEFAULT_THEME = 'basic'

/** Terminal users are impatient (design/README.md); everyone else gets 9. */
const SNOOZE_MINUTES = { terminal: 5 }

export function isValidTheme(id) {
    return THEMES.some((theme) => theme.id === id)
}

/** The header shows the active theme's name, so the label must always exist. */
export function themeLabel(id) {
    return THEMES.find((theme) => theme.id === id)?.label ?? id
}

export function isValidMode(mode) {
    return MODES.includes(mode)
}

export function defaultTheme() {
    return DEFAULT_THEME
}

/** Fall back to the scheme the user's OS already asked for. */
export function defaultMode(prefersDark = true) {
    return prefersDark ? 'dark' : 'light'
}

export function snoozeMinutesFor(theme) {
    return SNOOZE_MINUTES[theme] ?? DEFAULT_SNOOZE_MINUTES
}
