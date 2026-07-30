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

/** Hardware-style HR/MIN plastic keys, like the original clock radios. */
const KEYS = [
    { label: 'HR −', step: -60, hint: 'One hour earlier' },
    { label: 'MIN −', step: -5, hint: '5 minutes earlier' }
]
const KEYS_AFTER = [
    { label: 'MIN +', step: 5, hint: '5 minutes later' },
    { label: 'HR +', step: 60, hint: 'One hour later' }
]
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
                v-for="key in KEYS"
                :key="key.label"
                class="controls__key"
                type="button"
                :aria-label="key.hint"
                @click="time = shiftTimeInput(time, key.step)"
            >
                {{ key.label }}
            </button>
            <input v-model="time" class="controls__input" type="time" aria-label="Alarm time" required />
            <button
                v-for="key in KEYS_AFTER"
                :key="key.label"
                class="controls__key"
                type="button"
                :aria-label="key.hint"
                @click="time = shiftTimeInput(time, key.step)"
            >
                {{ key.label }}
            </button>
            <button class="controls__submit" type="submit">Set</button>
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
            <button class="controls__submit" type="submit">Set</button>
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
    background: var(--display);
    border: 1px solid var(--display-border);
    border-radius: 8px;
    display: flex;
    padding: 0.2rem;
}

.controls__tab {
    background: none;
    border: 0;
    border-radius: 6px;
    color: var(--muted);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    padding: 0.4rem 1rem;
    text-transform: uppercase;
}

.controls__tab.is-active {
    background: var(--seg-on);
    color: var(--accent-contrast);
}

.controls__row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.controls__key {
    background: var(--key);
    border: 1px solid var(--key-border);
    border-radius: 8px;
    box-shadow: 0 2px 0 rgb(0 0 0 / 25%);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    padding: 0.6rem 1rem;
    text-transform: uppercase;
    white-space: nowrap;
}

.controls__key:active {
    box-shadow: 0 1px 0 rgb(0 0 0 / 25%);
    transform: translateY(1px);
}

.controls__input {
    background: var(--display);
    border: 1px solid var(--display-border);
    border-radius: 8px;
    color: var(--seg-on);
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.4rem 0.8rem;
}

.controls__input--number {
    text-align: center;
    width: 5rem;
}

.controls__unit {
    color: var(--muted);
}

.controls__submit {
    background: var(--accent);
    border: 0;
    border-radius: 8px;
    box-shadow: 0 2px 0 rgb(0 0 0 / 30%);
    color: var(--accent-contrast);
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 0.7rem 1.4rem;
    text-transform: uppercase;
}

.controls__error {
    color: var(--danger);
}
</style>
