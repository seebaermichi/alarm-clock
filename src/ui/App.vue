<script setup>
import { inject, onMounted, watch } from 'vue'
import { useClock } from '@/composables/useClock.js'
import { useTheme } from '@/composables/useTheme.js'
import { formatClock, formatRingsIn } from '@/core/time.js'
import { snoozeMinutesFor, themeLabel } from '@/core/themes.js'
import ClockDisplay from './ClockDisplay.vue'
import AlarmControls from './AlarmControls.vue'
import AlarmList from './AlarmList.vue'
import RingingOverlay from './RingingOverlay.vue'
import ThemePicker from './ThemePicker.vue'

// Supplied by whichever entry point mounted this app — the web page or the
// extension popup. The component itself must not know which.
const platform = inject('platform')

const { now } = useClock(platform)
const {
    pending,
    upcoming,
    ringing,
    lateBy,
    firedWhileAway,
    error,
    alarms,
    setAtTime,
    setCountdown,
    setAt,
    cancel,
    dismiss,
    snoozeRinging
} = platform.createAlarms(now)
const { theme, mode, setTheme, setMode, toggleMode } = useTheme()

onMounted(async () => {
    const state = await platform.loadState()

    platform.hydrateAlarms(alarms, state.alarms)
    setTheme(state.theme)
    setMode(state.mode)
})

watch(theme, (value) => platform.saveTheme(value))
watch(mode, (value) => platform.saveMode(value))

// The web platform owns its alarm list and persists it here. In the extension
// the background worker owns it, and saveAlarms is a no-op — the list this
// component sees is a mirror of the worker's state.
watch(alarms, (value) => platform.saveAlarms(value), { deep: true })

// Riviera's quick-chips stack onto the armed alarm: +30 moves the upcoming
// alarm 30 minutes later, or starts from now when nothing is armed.
function addMinutes(minutes) {
    const base = upcoming.value ? upcoming.value.at : Date.now()

    if (upcoming.value) cancel(upcoming.value.id)
    setAt(base + minutes * 60_000)
}

const cancelUpcoming = () => upcoming.value && cancel(upcoming.value.id)
const cancelAll = () => pending.value.forEach((alarm) => cancel(alarm.id))
</script>

<template>
    <div class="app">
        <header class="app__header">
            <!-- Everyone can see this is an alarm clock; the title names the
                 active theme instead. -->
            <h1 class="app__title">{{ themeLabel(theme) }}</h1>
            <div class="app__prefs">
                <ThemePicker :theme="theme" @select="setTheme" />
                <!-- Labelled with the mode it switches to, not the current one. -->
                <button
                    class="app__mode"
                    type="button"
                    :aria-label="`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`"
                    @click="toggleMode"
                >
                    {{ mode === 'dark' ? 'light' : 'dark' }}
                </button>
            </div>
        </header>

        <main class="app__main">
            <ClockDisplay :now="now" :theme="theme" :has-alarm="Boolean(upcoming)" />

            <p class="app__next">
                <template v-if="upcoming">
                    Alarm {{ formatClock(upcoming.at) }} — rings in
                    {{ formatRingsIn(upcoming.at - now) }}
                </template>
                <template v-else>No alarm set</template>
            </p>

            <AlarmControls
                :theme="theme"
                :error="error"
                :upcoming="upcoming"
                @set-time="setAtTime"
                @set-countdown="setCountdown"
                @add-minutes="addMinutes"
                @cancel-upcoming="cancelUpcoming"
                @cancel-all="cancelAll"
            />

            <AlarmList :alarms="pending" :now="now" @cancel="cancel" />
        </main>

        <RingingOverlay
            v-if="ringing"
            :alarm="ringing"
            :theme="theme"
            :late-by="lateBy"
            :fired-while-away="firedWhileAway"
            @snooze="snoozeRinging(snoozeMinutesFor(theme))"
            @stop="dismiss"
        />
    </div>
</template>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.app__header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
}

.app__title {
    color: var(--muted);
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.app__prefs {
    align-items: center;
    display: flex;
    gap: 0.75rem;
}

.app__mode {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    padding: 0.4rem 0.9rem;
}

.app__main {
    align-items: center;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: center;
    padding: 1rem 1.5rem 4rem;
}

.app__next {
    color: var(--muted);
    font-size: 0.95rem;
    margin-top: -0.75rem;
}
</style>
