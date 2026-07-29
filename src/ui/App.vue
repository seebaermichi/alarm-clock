<script setup>
import { onMounted, watch } from 'vue'
import { createWebPlatform } from '@/platform/web.js'
import { useClock } from '@/composables/useClock.js'
import { useAlarms } from '@/composables/useAlarms.js'
import { useTheme } from '@/composables/useTheme.js'
import { formatDuration } from '@/core/time.js'
import ClockDisplay from './ClockDisplay.vue'
import AlarmControls from './AlarmControls.vue'
import AlarmList from './AlarmList.vue'
import RingingOverlay from './RingingOverlay.vue'
import ThemePicker from './ThemePicker.vue'

const platform = createWebPlatform()

const { now } = useClock(platform)
const { pending, upcoming, ringing, lateBy, firedWhileAway, error, alarms, setAtTime, setCountdown, cancel, dismiss, snoozeRinging } =
    useAlarms(platform, now)
const { theme, setTheme } = useTheme()

onMounted(async () => {
    const state = await platform.loadState()

    alarms.value = state.alarms
    setTheme(state.theme)
})

watch(
    [alarms, theme],
    () => platform.saveState({ alarms: alarms.value, theme: theme.value }),
    { deep: true }
)
</script>

<template>
    <div class="app">
        <header class="app__header">
            <h1 class="app__title">Alarm Clock</h1>
            <ThemePicker :theme="theme" @select="setTheme" />
        </header>

        <main class="app__main">
            <ClockDisplay :now="now" />

            <p class="app__next">
                <template v-if="upcoming">
                    Next alarm in {{ formatDuration(upcoming.at - now) }}
                </template>
                <template v-else>No alarm set</template>
            </p>

            <AlarmControls
                :error="error"
                @set-time="setAtTime"
                @set-countdown="setCountdown"
            />

            <AlarmList :alarms="pending" :now="now" @cancel="cancel" />
        </main>

        <RingingOverlay
            v-if="ringing"
            :alarm="ringing"
            :late-by="lateBy"
            :fired-while-away="firedWhileAway"
            @snooze="snoozeRinging()"
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
