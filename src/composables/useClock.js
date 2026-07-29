import { ref, onMounted, onUnmounted } from 'vue'

/**
 * A reactive `now`, driven by the platform ticker.
 *
 * It also re-syncs on visibilitychange and focus. A tab that was frozen wakes
 * with a stale `now`; without this the display would lag and any alarm that
 * came due during the freeze would look like it hadn't yet.
 */
export function useClock(platform) {
    const now = ref(Date.now())
    let ticker = null

    const sync = () => {
        now.value = Date.now()
    }

    onMounted(() => {
        ticker = platform.createTicker(sync)
        ticker.start()
        document.addEventListener('visibilitychange', sync)
        window.addEventListener('focus', sync)
    })

    onUnmounted(() => {
        ticker?.stop()
        document.removeEventListener('visibilitychange', sync)
        window.removeEventListener('focus', sync)
    })

    return { now }
}
