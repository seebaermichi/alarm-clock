<script setup>
import { formatClock, formatDuration } from '@/core/time.js'

defineProps({
    alarm: { type: Object, required: true },
    lateBy: { type: Number, default: 0 },
    firedWhileAway: { type: Boolean, default: false },
    snoozeMinutes: { type: Number, required: true }
})

defineEmits(['snooze', 'stop'])
</script>

<template>
    <!-- The page floods signal red; clicking anywhere snoozes. -->
    <div class="ringing" role="alertdialog" aria-label="Alarm ringing" @click="$emit('snooze')">
        <time class="ringing__time">{{ formatClock(alarm.at) }}</time>
        <p v-if="firedWhileAway" class="ringing__sub">
            Due {{ formatDuration(lateBy) }} ago — this tab was in the background.
        </p>
        <p v-else class="ringing__sub">Alarm — click anywhere to snooze {{ snoozeMinutes }} min</p>
        <div class="ringing__actions">
            <button class="ringing__snooze" type="button" @click.stop="$emit('snooze')">
                Snooze {{ snoozeMinutes }} min
            </button>
            <button class="ringing__stop" type="button" @click.stop="$emit('stop')">Stop</button>
        </div>
    </div>
</template>

<style scoped>
.ringing {
    align-items: center;
    background: var(--accent);
    color: var(--accent-contrast);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    inset: 0;
    justify-content: center;
    position: fixed;
    text-align: center;
    z-index: 10;
}

.ringing__time {
    font-size: clamp(4rem, 18vw, 9rem);
    font-weight: 700;
    letter-spacing: 0.02em;
}

.ringing__sub {
    font-size: 1.05rem;
    opacity: 0.9;
}

.ringing__actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.ringing__snooze {
    background: var(--accent-contrast);
    border: 0;
    border-radius: 999px;
    color: var(--st-pill-text);
    font-weight: 600;
    padding: 0.85rem 1.6rem;
}

.ringing__stop {
    background: none;
    border: 1px solid color-mix(in srgb, var(--accent-contrast) 55%, transparent);
    border-radius: 999px;
    color: var(--accent-contrast);
    padding: 0.85rem 1.2rem;
}
</style>
