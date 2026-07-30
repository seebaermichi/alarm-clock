import { ref, computed, onUnmounted } from 'vue'
import browser from 'webextension-polyfill'
import { pendingAlarms, nextAlarm, nextOccurrence, fromCountdown } from '@/core/alarm.js'

/**
 * The popup's view of the background worker's alarm state.
 *
 * Deliberately dumb: it never schedules or fires anything itself. The popup
 * lives only while it is open, so anything it owned would die with it. It
 * sends commands to the worker and mirrors what comes back through storage.
 */
export function useExtensionAlarms(now) {
    const alarms = ref([])
    const ringing = ref(null)
    const error = ref('')

    const pending = computed(() => pendingAlarms(alarms.value, now.value))
    const upcoming = computed(() => nextAlarm(alarms.value, now.value))

    // The worker fires alarms whether or not this popup is open, so "late" is
    // meaningless here — by the time the popup renders, it has already rung.
    const lateBy = ref(0)
    const firedWhileAway = computed(() => false)

    async function refresh() {
        const { alarms: stored = [], ringing: current = null } = await browser.storage.local.get([
            'alarms',
            'ringing'
        ])

        alarms.value = stored
        ringing.value = current
    }

    function onChanged(changes, area) {
        if (area !== 'local') return
        if (changes.alarms) alarms.value = changes.alarms.newValue ?? []
        if (changes.ringing) ringing.value = changes.ringing.newValue ?? null
    }

    browser.storage.onChanged.addListener(onChanged)
    onUnmounted(() => browser.storage.onChanged.removeListener(onChanged))
    refresh()

    const send = (message) => browser.runtime.sendMessage(message).catch(() => {})

    function arm(at) {
        if (!at) {
            error.value = 'Enter a valid time.'
            return false
        }

        error.value = ''
        send({ type: 'ADD_ALARM', at })

        return true
    }

    return {
        alarms,
        pending,
        upcoming,
        ringing,
        lateBy,
        firedWhileAway,
        error,
        setAtTime: (hhmm) => arm(nextOccurrence(hhmm, Date.now())),
        setCountdown: (minutes) => arm(fromCountdown(minutes, Date.now())),
        setAt: (at) => arm(Number.isFinite(at) && at > Date.now() ? at : null),
        cancel: (id) => send({ type: 'CANCEL_ALARM', id }),
        dismiss: () => send({ type: 'STOP' }),
        snoozeRinging: (minutes) => send({ type: 'SNOOZE', minutes })
    }
}
