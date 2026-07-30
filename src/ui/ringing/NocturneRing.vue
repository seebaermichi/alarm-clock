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
    <!-- Gentle waking: the screen slowly brightens over 20s, and the entire
         screen is the snooze target. Stop is deliberately small. -->
    <div class="ringing" role="alertdialog" aria-label="Alarm ringing" @click="$emit('snooze')">
        <time class="ringing__time">{{ formatClock(alarm.at) }}</time>
        <p v-if="firedWhileAway" class="ringing__sub">
            Due {{ formatDuration(lateBy) }} ago — this tab was in the background.
        </p>
        <p v-else class="ringing__sub">Tap anywhere to snooze</p>
        <button class="ringing__stop" type="button" @click.stop="$emit('stop')">stop</button>
    </div>
</template>

<style scoped>
.ringing {
    align-items: center;
    animation: dawn 20s linear forwards;
    background: var(--bg);
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
    animation: pulse 2s ease-in-out infinite;
    color: var(--text);
    font-size: clamp(4rem, 18vw, 9rem);
    font-weight: 600;
    text-shadow: var(--glow);
}

.ringing__sub {
    color: var(--text);
    font-size: 1.15rem;
    font-weight: 600;
}

.ringing__stop {
    background: none;
    border: 0;
    color: var(--muted);
    font-size: 0.9rem;
    margin-top: 0.5rem;
    text-decoration: underline;
}

@keyframes dawn {
    to {
        filter: brightness(1.9);
    }
}

@keyframes pulse {
    50% {
        opacity: 0.55;
    }
}
</style>
