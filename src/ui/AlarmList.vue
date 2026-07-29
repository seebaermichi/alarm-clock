<script setup>
import { formatClock, formatDuration } from '@/core/time.js'

defineProps({
    alarms: { type: Array, required: true },
    now: { type: Number, required: true }
})

defineEmits(['cancel'])
</script>

<template>
    <section v-if="alarms.length" class="alarms" aria-label="Scheduled alarms">
        <ul class="alarms__list">
            <li v-for="alarm in alarms" :key="alarm.id" class="alarms__item">
                <span class="alarms__time">{{ formatClock(alarm.at) }}</span>
                <span class="alarms__in">in {{ formatDuration(alarm.at - now) }}</span>
                <button
                    class="alarms__cancel"
                    type="button"
                    :aria-label="`Cancel alarm at ${formatClock(alarm.at)}`"
                    @click="$emit('cancel', alarm.id)"
                >
                    ×
                </button>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.alarms__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    min-width: min(22rem, 90vw);
}

.alarms__item {
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    gap: 0.75rem;
    padding: 0.6rem 0.9rem;
}

.alarms__time {
    color: var(--digit);
    font-family: 'digital-7regular', monospace;
    font-size: 1.9rem;
    line-height: 1;
}

.alarms__in {
    color: var(--muted);
    flex: 1;
    font-size: 0.9rem;
}

.alarms__cancel {
    background: none;
    border: 0;
    border-radius: 6px;
    color: var(--muted);
    font-size: 1.4rem;
    line-height: 1;
    padding: 0 0.4rem;
}

.alarms__cancel:hover {
    background: var(--danger);
    color: var(--danger-contrast);
}
</style>
