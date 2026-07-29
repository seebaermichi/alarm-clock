import { ref, watch } from 'vue'
import { isValidTheme, defaultTheme } from '@/core/themes.js'

/**
 * Owns the data-theme attribute on <html>, which is what every CSS custom
 * property block keys off. Set on the root element rather than the app root so
 * the page background follows the theme too.
 */
export function useTheme() {
    const theme = ref(defaultTheme())

    watch(
        theme,
        (value) => {
            document.documentElement.dataset.theme = value
        },
        { immediate: true }
    )

    function setTheme(id) {
        if (isValidTheme(id)) theme.value = id
    }

    return { theme, setTheme }
}
