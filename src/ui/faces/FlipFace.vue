<script setup>
import { computed } from 'vue'
import { clockParts, digitsOf, formatClock } from '@/core/time.js'
import FlipCard from './FlipCard.vue'

const props = defineProps({
    now: { type: Number, required: true }
})

const parts = computed(() => clockParts(props.now))
const hours = computed(() => digitsOf(parts.value.hours))
const minutes = computed(() => digitsOf(parts.value.minutes))
const seconds = computed(() => digitsOf(parts.value.seconds))
</script>

<template>
    <div class="board" role="timer" :aria-label="`Current time ${formatClock(now)}`">
        <div class="board__group">
            <FlipCard v-for="(digit, i) in hours" :key="i" :digit="digit" />
        </div>
        <div class="board__group">
            <FlipCard v-for="(digit, i) in minutes" :key="i" :digit="digit" />
        </div>
        <div class="board__group">
            <FlipCard v-for="(digit, i) in seconds" :key="i" :digit="digit" small />
        </div>
    </div>
</template>

<style scoped>
.board {
    align-items: flex-end;
    display: flex;
    gap: 14px;
    user-select: none;
}

.board__group {
    display: flex;
    gap: 6px;
}
</style>
