<script setup>
import { formatClock } from '@/core/time.js'

defineProps({
    now: { type: Number, required: true }
})
</script>

<template>
    <div class="time" role="timer" :aria-label="`Current time ${formatClock(now)}`">
        {{ formatClock(now, { withSeconds: true }) }}
    </div>
</template>

<style scoped>
.time {
    color: var(--digit);
    font-size: clamp(3rem, 12vw, 5.5rem);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-shadow: var(--glow);
    user-select: none;
}
</style>
