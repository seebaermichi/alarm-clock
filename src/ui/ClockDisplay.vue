<script setup>
import { computed } from 'vue'
import { clockParts, digitsOf, formatClock } from '@/core/time.js'
import ClockDigit from './ClockDigit.vue'

const props = defineProps({
    now: { type: Number, required: true },
    withSeconds: { type: Boolean, default: true }
})

const parts = computed(() => clockParts(props.now))
const groups = computed(() =>
    [parts.value.hours, parts.value.minutes, ...(props.withSeconds ? [parts.value.seconds] : [])].map(
        (part) => digitsOf(part)
    )
)
</script>

<template>
    <div class="clock" role="timer" :aria-label="`Current time ${formatClock(now)}`">
        <template v-for="(group, index) in groups" :key="index">
            <span v-if="index > 0" class="clock__colon" aria-hidden="true">:</span>
            <ClockDigit v-for="(digit, position) in group" :key="position" :digit="digit" />
        </template>
    </div>
</template>

<style scoped>
.clock {
    align-items: center;
    display: flex;
    font-family: 'digital-7regular', monospace;
    font-size: clamp(4rem, 18vw, 11rem);
    justify-content: center;
    line-height: 1.1;
    user-select: none;
}

.clock__colon {
    color: var(--digit);
    opacity: 0.75;
    padding: 0 0.1em;
    text-shadow: var(--glow);
}
</style>
