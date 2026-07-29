<script setup>
import { ref } from 'vue'

const emit = defineEmits(['set-time', 'set-countdown'])

defineProps({
    error: { type: String, default: '' }
})

const mode = ref('time')
const time = ref('')
const minutes = ref(25)

const QUICK = [5, 10, 15, 25, 45]

function submit() {
    if (mode.value === 'time') {
        emit('set-time', time.value)
    } else {
        emit('set-countdown', minutes.value)
    }
}
</script>

<template>
    <section class="controls">
        <div class="controls__modes" role="tablist" aria-label="Alarm type">
            <button
                v-for="option in [
                    { id: 'time', label: 'At a time' },
                    { id: 'countdown', label: 'In a while' }
                ]"
                :key="option.id"
                class="controls__mode"
                :class="{ 'is-active': mode === option.id }"
                type="button"
                role="tab"
                :aria-selected="mode === option.id"
                @click="mode = option.id"
            >
                {{ option.label }}
            </button>
        </div>

        <form class="controls__row" @submit.prevent="submit">
            <input
                v-if="mode === 'time'"
                v-model="time"
                class="controls__input"
                type="time"
                aria-label="Alarm time"
                required
            />

            <template v-else>
                <input
                    v-model.number="minutes"
                    class="controls__input controls__input--number"
                    type="number"
                    min="1"
                    max="1440"
                    aria-label="Minutes from now"
                    required
                />
                <span class="controls__unit">min</span>
            </template>

            <!-- Submitting is the user gesture that unlocks audio and lets us
                 ask for notification permission. Both must happen here. -->
            <button class="controls__submit" type="submit">Set</button>
        </form>

        <div v-if="mode === 'countdown'" class="controls__quick">
            <button
                v-for="value in QUICK"
                :key="value"
                class="controls__chip"
                type="button"
                @click="emit('set-countdown', value)"
            >
                {{ value }}m
            </button>
        </div>

        <p v-if="error" class="controls__error" role="alert">{{ error }}</p>
    </section>
</template>

<style scoped>
.controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.controls__modes {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    display: flex;
    padding: 0.25rem;
}

.controls__mode {
    background: none;
    border: 0;
    border-radius: 999px;
    color: var(--muted);
    padding: 0.4rem 1rem;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.controls__mode.is-active {
    background: var(--accent);
    color: var(--accent-contrast);
}

.controls__row {
    align-items: center;
    display: flex;
    gap: 0.5rem;
}

.controls__input {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'digital-7regular', monospace;
    font-size: 2.5rem;
    padding: 0.25rem 0.75rem;
}

.controls__input--number {
    width: 5rem;
    text-align: center;
}

.controls__unit {
    color: var(--muted);
}

.controls__submit {
    background: var(--accent);
    border: 0;
    border-radius: 10px;
    color: var(--accent-contrast);
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
}

.controls__quick {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.controls__chip {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    padding: 0.35rem 0.9rem;
}

.controls__chip:hover {
    border-color: var(--accent);
    color: var(--text);
}

.controls__error {
    color: var(--danger);
}
</style>
