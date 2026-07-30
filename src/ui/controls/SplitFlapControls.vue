<script setup>
import { ref } from 'vue'
import { shiftTimeInput } from '@/core/alarm.js'

const emit = defineEmits(['set-time', 'set-countdown'])

defineProps({
    error: { type: String, default: '' }
})

const kind = ref('at')
const time = ref('07:30')
const minutes = ref(20)
</script>

<template>
    <section class="controls" aria-label="Alarm">
        <div class="controls__tabs" role="tablist" aria-label="Alarm type">
            <button
                v-for="option in [
                    { id: 'at', label: 'At a time' },
                    { id: 'in', label: 'In a while' }
                ]"
                :key="option.id"
                class="controls__tab"
                :class="{ 'is-active': kind === option.id }"
                type="button"
                role="tab"
                :aria-selected="kind === option.id"
                @click="kind = option.id"
            >
                {{ option.label }}
            </button>
        </div>

        <form v-if="kind === 'at'" class="controls__row" @submit.prevent="emit('set-time', time)">
            <button
                class="controls__step"
                type="button"
                aria-label="5 minutes earlier"
                @click="time = shiftTimeInput(time, -5)"
            >
                −
            </button>
            <input v-model="time" class="controls__input" type="time" aria-label="Alarm time" required />
            <button
                class="controls__step"
                type="button"
                aria-label="5 minutes later"
                @click="time = shiftTimeInput(time, 5)"
            >
                +
            </button>
            <button class="controls__submit" type="submit">SET</button>
        </form>

        <form v-else class="controls__row" @submit.prevent="emit('set-countdown', minutes)">
            <input
                v-model.number="minutes"
                class="controls__input controls__input--number"
                type="number"
                min="1"
                max="720"
                aria-label="Minutes"
                required
            />
            <span class="controls__unit">min</span>
            <button class="controls__submit" type="submit">SET</button>
        </form>

        <p v-if="error" class="controls__error" role="alert">{{ error }}</p>
    </section>
</template>

<style scoped>
.controls {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.controls__tabs {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    display: flex;
    padding: 0.25rem;
}

.controls__tab {
    background: none;
    border: 0;
    border-radius: 999px;
    color: var(--muted);
    padding: 0.4rem 1rem;
}

.controls__tab.is-active {
    background: var(--accent);
    color: var(--accent-contrast);
}

.controls__row {
    align-items: center;
    display: flex;
    gap: 0.5rem;
}

.controls__step {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    height: 36px;
    width: 36px;
}

.controls__input {
    background: var(--sf-card);
    border: 1px solid var(--sf-card-border);
    border-radius: 8px;
    color: var(--digit);
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 0.35rem 0.75rem;
}

.controls__input--number {
    text-align: center;
    width: 5.5rem;
}

.controls__unit {
    color: var(--muted);
}

.controls__submit {
    background: var(--accent);
    border: 0;
    border-radius: 8px;
    color: var(--accent-contrast);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 0.7rem 1.3rem;
}

.controls__error {
    color: var(--danger);
}
</style>
