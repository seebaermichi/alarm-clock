/**
 * Theme identities. The colours themselves live in styles/themes.scss as CSS
 * custom properties under :root[data-theme="…"] — this module only names them,
 * so the picker and the persistence layer agree on the set.
 */

export const THEMES = [
    { id: 'lcd', label: 'LCD', hint: 'Classic phosphor green', scheme: 'dark' },
    { id: 'amber', label: 'Amber', hint: 'Warm Nixie glow', scheme: 'dark' },
    { id: 'midnight', label: 'Midnight', hint: 'Low contrast, for night', scheme: 'dark' },
    { id: 'paper', label: 'Paper', hint: 'Light and minimal', scheme: 'light' },
    { id: 'synthwave', label: 'Synthwave', hint: 'Magenta neon', scheme: 'dark' }
]

export const DEFAULT_DARK_THEME = 'lcd'
export const DEFAULT_LIGHT_THEME = 'paper'

export function isValidTheme(id) {
    return THEMES.some((theme) => theme.id === id)
}

/** Fall back to the scheme the user's OS already asked for. */
export function defaultTheme(prefersDark = true) {
    return prefersDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME
}
