<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { pad2 } from '@/core/time.js'

const emit = defineEmits(['set-time', 'cancel-upcoming'])

const props = defineProps({
    error: { type: String, default: '' },
    upcoming: { type: Object, default: null }
})

/**
 * Night ergonomics: no typing. Big steppers move the wake time in 5-minute
 * taps (hold to auto-repeat), ARM toggles the alarm. Wake time is minutes
 * since midnight.
 */
const wake = ref(7 * 60 + 30)
const armed = computed(() => Boolean(props.upcoming))
const wakeLabel = computed(() => `${pad2(Math.floor(wake.value / 60))}:${pad2(wake.value % 60)}`)

let repeat = null

function bump(step) {
    wake.value = (wake.value + step + 1440) % 1440
}

function pressStart(step) {
    repeat = setInterval(() => bump(step), 180)
}

function pressEnd() {
    clearInterval(repeat)
    repeat = null
}

onUnmounted(pressEnd)

function toggle() {
    if (armed.value) {
        emit('cancel-upcoming')
    } else {
        emit('set-time', wakeLabel.value)
    }
}
</script>

<template>
    <section class="controls" aria-label="Alarm">
        <div class="controls__row">
            <span class="controls__label">WAKE AT</span>
            <button
                class="controls__step"
                type="button"
                aria-label="5 minutes earlier"
                @click="bump(-5)"
                @pointerdown="pressStart(-5)"
                @pointerup="pressEnd"
                @pointerleave="pressEnd"
            >
                −
            </button>
            <span class="controls__time">{{ wakeLabel }}</span>
            <button
                class="controls__step"
                type="button"
                aria-label="5 minutes later"
                @click="bump(5)"
                @pointerdown="pressStart(5)"
                @pointerup="pressEnd"
                @pointerleave="pressEnd"
            >
                +
            </button>
            <button
                class="controls__submit"
                :class="{ 'is-armed': armed }"
                type="button"
                :aria-pressed="armed"
                @click="toggle"
            >
                {{ armed ? 'ARMED' : 'ARM' }}
            </button>
        </div>

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
    gap: 0.7rem;
}

.controls__label {
    color: var(--muted);
    font-size: 0.8rem;
    letter-spacing: 0.12em;
}

.controls__step {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text);
    font-size: 1.05rem;
    height: 42px;
    touch-action: none;
    width: 42px;
}

.controls__time {
    color: var(--text);
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    min-width: 5.2rem;
    text-align: center;
    text-shadow: var(--glow);
}

.controls__submit {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    padding: 0.7rem 1.3rem;
}

.controls__submit.is-armed {
    background: var(--accent);
    color: var(--accent-contrast);
}

.controls__error {
    color: var(--danger);
}
</style>
