<script setup>
import { formatClock, formatDuration } from '@/core/time.js'
import { DEFAULT_SNOOZE_MINUTES } from '@/core/alarm.js'

defineProps({
    alarm: { type: Object, required: true },
    lateBy: { type: Number, default: 0 },
    firedWhileAway: { type: Boolean, default: false }
})

defineEmits(['snooze', 'stop'])
</script>

<template>
    <div class="ringing" role="alertdialog" aria-label="Alarm ringing">
        <p class="ringing__time">{{ formatClock(alarm.at) }}</p>

        <!-- If the tab was asleep the alarm may be arriving well after it was
             due. Saying so is more honest than pretending it just rang. -->
        <p v-if="firedWhileAway" class="ringing__late">
            Due {{ formatDuration(lateBy) }} ago — this tab was in the background.
        </p>
        <p v-else class="ringing__label">{{ alarm.label || 'Time is up.' }}</p>

        <div class="ringing__actions">
            <button class="ringing__button ringing__button--snooze" type="button" @click="$emit('snooze')">
                Snooze {{ DEFAULT_SNOOZE_MINUTES }}m
            </button>
            <button class="ringing__button ringing__button--stop" type="button" @click="$emit('stop')">
                Stop
            </button>
        </div>
    </div>
</template>

<style scoped>
.ringing {
    align-items: center;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    inset: 0;
    justify-content: center;
    padding: 2rem;
    position: fixed;
    text-align: center;
    z-index: 10;
}

.ringing__time {
    animation: pulse 1s ease-in-out infinite;
    color: var(--digit);
    font-family: 'digital-7regular', monospace;
    font-size: clamp(5rem, 22vw, 13rem);
    line-height: 1;
    text-shadow: var(--glow);
}

.ringing__late {
    color: var(--danger);
}

.ringing__label {
    color: var(--muted);
}

.ringing__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
}

.ringing__button {
    border: 0;
    border-radius: 10px;
    font-size: 1.15rem;
    font-weight: 600;
    padding: 0.9rem 2rem;
}

.ringing__button--snooze {
    background: var(--accent);
    color: var(--accent-contrast);
}

.ringing__button--stop {
    background: var(--danger);
    color: var(--danger-contrast);
}

@keyframes pulse {
    50% {
        opacity: 0.45;
    }
}
</style>
