import { ref, computed, watch } from 'vue'
import {
    addAlarm,
    removeAlarm,
    createAlarm,
    dueAlarms,
    pendingAlarms,
    nextAlarm,
    nextOccurrence,
    fromCountdown,
    snooze,
    DEFAULT_SNOOZE_MINUTES
} from '@/core/alarm.js'
import { formatClock } from '@/core/time.js'

/** Anything later than this means the tab was genuinely asleep, not just slow. */
const LATE_THRESHOLD_MS = 2000

export function useAlarms(platform, now) {
    const alarms = ref([])
    const ringing = ref(null)
    const lateBy = ref(0)
    const error = ref('')

    const pending = computed(() => pendingAlarms(alarms.value, now.value))
    const upcoming = computed(() => nextAlarm(alarms.value, now.value))
    const firedWhileAway = computed(() => lateBy.value > LATE_THRESHOLD_MS)

    // The heart of the fix: fire on `at <= now`, never on a string match.
    // A tick that arrives late still finds the alarm overdue and rings it.
    watch(now, (value) => {
        if (ringing.value) return

        const due = dueAlarms(alarms.value, value)

        if (!due.length) return

        const first = due[0]
        const dueIds = new Set(due.map((alarm) => alarm.id))

        alarms.value = alarms.value.filter((alarm) => !dueIds.has(alarm.id))
        ringing.value = first
        lateBy.value = value - first.at

        platform.playAlarm()
        platform.notify({
            title: `Alarm — ${formatClock(first.at)}`,
            body: first.label || 'Time is up.'
        })
    })

    /**
     * Both entry points run inside a real click, which is the only moment the
     * browser will let us unlock audio or ask for notification permission.
     *
     * Order matters: schedule first, ask second. Awaiting the permission
     * prompt before adding the alarm means a user who ignores or dismisses
     * that prompt silently ends up with no alarm at all — the exact class of
     * quiet failure this rewrite exists to remove. Notifications are an
     * enhancement; the alarm must not depend on them.
     */
    function arm(at) {
        if (!at) {
            error.value = 'Enter a valid time.'
            return false
        }

        error.value = ''
        platform.unlockAudio()
        alarms.value = addAlarm(alarms.value, createAlarm(at))
        platform.requestPermission()

        return true
    }

    const setAtTime = (hhmm) => arm(nextOccurrence(hhmm, Date.now()))
    const setCountdown = (minutes) => arm(fromCountdown(minutes, Date.now()))

    function cancel(id) {
        alarms.value = removeAlarm(alarms.value, id)
    }

    function dismiss() {
        platform.stopAlarm()
        ringing.value = null
        lateBy.value = 0
    }

    function snoozeRinging(minutes = DEFAULT_SNOOZE_MINUTES) {
        const at = snooze(Date.now(), minutes)

        dismiss()
        alarms.value = addAlarm(alarms.value, createAlarm(at))
    }

    return {
        alarms,
        pending,
        upcoming,
        ringing,
        lateBy,
        firedWhileAway,
        error,
        setAtTime,
        setCountdown,
        cancel,
        dismiss,
        snoozeRinging
    }
}
