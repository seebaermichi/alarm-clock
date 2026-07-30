import { ref, watch } from 'vue'
import { isValidTheme, isValidMode, defaultTheme, defaultMode } from '@/core/themes.js'

/**
 * Owns the data-theme and data-mode attributes on <html>, which is what every
 * CSS custom property block keys off. Set on the root element rather than the
 * app root so the page background follows the theme too.
 */
export function useTheme() {
    const theme = ref(defaultTheme())
    const mode = ref(defaultMode())

    watch(
        theme,
        (value) => {
            document.documentElement.dataset.theme = value
        },
        { immediate: true }
    )

    watch(
        mode,
        (value) => {
            document.documentElement.dataset.mode = value
        },
        { immediate: true }
    )

    function setTheme(id) {
        if (isValidTheme(id)) theme.value = id
    }

    function setMode(value) {
        if (isValidMode(value)) mode.value = value
    }

    function toggleMode() {
        mode.value = mode.value === 'dark' ? 'light' : 'dark'
    }

    return { theme, mode, setTheme, setMode, toggleMode }
}
