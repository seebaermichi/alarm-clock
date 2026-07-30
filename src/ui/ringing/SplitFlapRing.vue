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
    <!-- The departure-board rail takes over: near-black in both modes, so its
         tokens live on the theme block, not the mode blocks. -->
    <div class="ringing" role="alertdialog" aria-label="Alarm ringing">
        <div class="ringing__label">
            <span class="ringing__dot"></span>
            WAKE UP
        </div>
        <time class="ringing__time">{{ formatClock(alarm.at) }}</time>
        <p v-if="firedWhileAway" class="ringing__late">
            Due {{ formatDuration(lateBy) }} ago — this tab was in the background.
        </p>
        <div class="ringing__actions">
            <button class="ringing__snooze" type="button" @click="$emit('snooze')">
                SNOOZE {{ snoozeMinutes }} MIN
            </button>
            <button class="ringing__stop" type="button" @click="$emit('stop')">STOP</button>
        </div>
        <p class="ringing__hint">Space = snooze · Q = stop</p>
    </div>
</template>

<style scoped>
.ringing {
    align-items: center;
    background: var(--sf-rail);
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    inset: 0;
    justify-content: center;
    position: fixed;
    text-align: center;
    z-index: 10;
}

.ringing__label {
    align-items: center;
    color: var(--accent);
    display: flex;
    font-size: 0.9rem;
    font-weight: 700;
    gap: 10px;
    letter-spacing: 0.24em;
}

.ringing__dot {
    animation: blink 1s steps(1) infinite;
    background: var(--accent);
    border-radius: 50%;
    height: 9px;
    width: 9px;
}

.ringing__time {
    color: var(--sf-rail-digit);
    font-size: clamp(4rem, 18vw, 9rem);
    font-weight: 700;
    letter-spacing: 0.04em;
}

.ringing__late {
    color: var(--sf-rail-muted);
}

.ringing__actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.ringing__snooze {
    background: var(--accent);
    border: 0;
    border-radius: 8px;
    color: var(--accent-contrast);
    font-size: 1rem;
    font-weight: 700;
    padding: 0.9rem 1.6rem;
}

.ringing__stop {
    background: none;
    border: 1px solid var(--sf-rail-border);
    border-radius: 8px;
    color: var(--sf-rail-muted);
    padding: 0.9rem 1.2rem;
}

.ringing__hint {
    color: var(--sf-rail-hint);
    font-size: 0.85rem;
}

@keyframes blink {
    50% {
        opacity: 0.15;
    }
}
</style>
