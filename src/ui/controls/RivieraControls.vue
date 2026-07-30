<script setup>
import { ref } from 'vue'

const emit = defineEmits(['set-time', 'add-minutes'])

defineProps({
    error: { type: String, default: '' }
})

const time = ref('07:30')

/** Quick-chips stack additively onto the current alarm (App owns the math). */
const CHIPS = [
    { minutes: 10, label: '+10 min' },
    { minutes: 30, label: '+30 min' },
    { minutes: 60, label: '+1 h' }
]
</script>

<template>
    <section class="controls" aria-label="Alarm">
        <div class="controls__row">
            <button
                v-for="chip in CHIPS"
                :key="chip.minutes"
                class="controls__chip"
                type="button"
                @click="emit('add-minutes', chip.minutes)"
            >
                {{ chip.label }}
            </button>
        </div>

        <form class="controls__row" @submit.prevent="emit('set-time', time)">
            <input v-model="time" class="controls__input" type="time" aria-label="Alarm time" required />
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

.controls__row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.controls__chip {
    background: none;
    border: 1.5px solid var(--chip);
    border-radius: 999px;
    color: var(--chip-text);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.5rem 0.9rem;
}

.controls__input {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-size: 1.3rem;
    font-weight: 700;
    padding: 0.45rem 0.9rem;
}

.controls__submit {
    background: var(--accent);
    border: 0;
    border-radius: 12px;
    color: var(--accent-contrast);
    font-weight: 700;
    padding: 0.75rem 1.3rem;
}

.controls__error {
    color: var(--danger);
}
</style>
