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
    <div class="ringing" role="alertdialog" aria-label="Alarm ringing">
        <span class="ringing__banner">!! ALARM {{ formatClock(alarm.at) }} !!</span>
        <time class="ringing__time">{{ formatClock(alarm.at) }}</time>
        <p v-if="firedWhileAway" class="ringing__late">
            due {{ formatDuration(lateBy) }} ago — this tab was in the background
        </p>
        <p class="ringing__keys">[space] snooze {{ snoozeMinutes }}m&nbsp;&nbsp;&nbsp;[q] stop</p>
        <div class="ringing__actions">
            <button class="ringing__button" type="button" @click="$emit('snooze')">snooze</button>
            <button class="ringing__button" type="button" @click="$emit('stop')">stop</button>
        </div>
    </div>
</template>

<style scoped>
.ringing {
    align-items: center;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    inset: 0;
    justify-content: center;
    position: fixed;
    text-align: center;
    z-index: 10;
}

.ringing__banner {
    animation: blink 1s steps(1) infinite;
    background: var(--accent);
    color: var(--accent-contrast);
    font-size: 1.1rem;
    font-weight: 700;
    padding: 0.35rem 0.9rem;
}

.ringing__time {
    color: var(--digit);
    font-size: clamp(4rem, 18vw, 8rem);
    font-weight: 700;
    text-shadow: var(--glow);
}

.ringing__late {
    color: var(--danger);
    font-size: 0.9rem;
}

.ringing__keys {
    font-size: 1rem;
}

.ringing__actions {
    display: flex;
    gap: 0.6rem;
}

.ringing__button {
    background: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    padding: 0.6rem 1.1rem;
}

@keyframes blink {
    50% {
        opacity: 0.15;
    }
}
</style>
