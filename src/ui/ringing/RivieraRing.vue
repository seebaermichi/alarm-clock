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
        <div class="ringing__shapes" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <p class="ringing__hello">Good morning!</p>
        <time class="ringing__time">{{ formatClock(alarm.at) }}</time>
        <p v-if="firedWhileAway" class="ringing__late">
            Due {{ formatDuration(lateBy) }} ago — this tab was in the background.
        </p>
        <div class="ringing__actions">
            <button class="ringing__snooze" type="button" @click="$emit('snooze')">Snooze</button>
            <button class="ringing__stop" type="button" @click="$emit('stop')">Stop</button>
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

/* The four dial markers, bouncing in a staggered round. */
.ringing__shapes {
    display: flex;
    gap: 1rem;
}

.ringing__shapes i {
    animation: bounce 1s ease-in-out infinite;
    display: block;
    height: 22px;
    width: 22px;
}

.ringing__shapes i:nth-child(1) {
    background: var(--shape-1);
    border-radius: 50%;
}

.ringing__shapes i:nth-child(2) {
    animation-delay: 0.12s;
    background: var(--shape-2);
}

.ringing__shapes i:nth-child(3) {
    animation-delay: 0.24s;
    background: var(--shape-3);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.ringing__shapes i:nth-child(4) {
    animation-delay: 0.36s;
    background: var(--shape-4);
    transform: rotate(45deg);
}

.ringing__hello {
    font-size: 1.5rem;
    font-weight: 700;
}

.ringing__time {
    font-size: clamp(4rem, 16vw, 8rem);
    font-weight: 700;
}

.ringing__late {
    color: var(--muted);
}

.ringing__actions {
    display: flex;
    gap: 0.75rem;
}

.ringing__snooze {
    background: var(--shape-3);
    border: 0;
    border-radius: 999px;
    color: var(--rv-snooze-text);
    font-weight: 700;
    padding: 0.85rem 1.6rem;
}

.ringing__stop {
    background: none;
    border: 1.5px solid var(--shape-4);
    border-radius: 999px;
    color: var(--shape-4);
    font-weight: 600;
    padding: 0.85rem 1.2rem;
}

@keyframes bounce {
    50% {
        transform: translateY(-12px);
    }
}
</style>
