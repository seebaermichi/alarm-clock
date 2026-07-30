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
        <time class="ringing__time">{{ formatClock(alarm.at) }}</time>
        <p v-if="firedWhileAway" class="ringing__late">
            Due {{ formatDuration(lateBy) }} ago — this tab was in the background.
        </p>
        <!-- The signature of these clocks: a snooze bar you can hit half-asleep. -->
        <button class="ringing__snooze-bar" type="button" @click="$emit('snooze')">Snooze</button>
        <button class="ringing__stop" type="button" @click="$emit('stop')">Alarm off</button>
        <p class="ringing__hint">Space = snooze · Q = stop</p>
    </div>
</template>

<style scoped>
.ringing {
    align-items: center;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    inset: 0;
    justify-content: center;
    position: fixed;
    text-align: center;
    z-index: 10;
}

.ringing__time {
    animation: blink 1s steps(1) infinite;
    color: var(--seg-on);
    filter: var(--seg-glow);
    font-family: var(--font-time);
    font-size: clamp(3.5rem, 15vw, 7rem);
    font-weight: 700;
    letter-spacing: 0.06em;
}

.ringing__late {
    color: var(--muted);
}

.ringing__snooze-bar {
    background: var(--key);
    border: 1px solid var(--key-border);
    border-radius: 14px;
    box-shadow: 0 4px 0 rgb(0 0 0 / 30%);
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    padding: 1.4rem 0;
    text-transform: uppercase;
    width: min(480px, 84vw);
}

.ringing__snooze-bar:active {
    box-shadow: 0 2px 0 rgb(0 0 0 / 30%);
    transform: translateY(2px);
}

.ringing__stop {
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--muted);
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    padding: 0.7rem 1.2rem;
    text-transform: uppercase;
}

.ringing__hint {
    color: var(--muted);
    font-size: 0.85rem;
}

@keyframes blink {
    50% {
        opacity: 0.25;
    }
}
</style>
