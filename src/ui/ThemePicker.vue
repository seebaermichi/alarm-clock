<script setup>
import { THEMES } from '@/core/themes.js'

defineProps({
    theme: { type: String, required: true }
})

defineEmits(['select'])
</script>

<template>
    <div class="themes" role="radiogroup" aria-label="Theme">
        <button
            v-for="option in THEMES"
            :key="option.id"
            class="themes__swatch"
            :class="[`themes__swatch--${option.id}`, { 'is-active': theme === option.id }]"
            type="button"
            role="radio"
            :aria-checked="theme === option.id"
            :title="`${option.label} — ${option.hint}`"
            :aria-label="`${option.label} theme`"
            @click="$emit('select', option.id)"
        />
    </div>
</template>

<style scoped>
.themes {
    display: flex;
    gap: 0.5rem;
}

.themes__swatch {
    border: 2px solid transparent;
    border-radius: 50%;
    height: 1.6rem;
    outline-offset: 2px;
    transition: transform 0.15s ease;
    width: 1.6rem;
}

.themes__swatch:hover {
    transform: scale(1.15);
}

.themes__swatch.is-active {
    border-color: var(--text);
}

/* Swatches must show their own theme's colours, not the active one's, so
   these are the only hard-coded values in the app. */
.themes__swatch--lcd {
    background: linear-gradient(135deg, #4dff9b 50%, #0b0f0c 50%);
}

.themes__swatch--amber {
    background: linear-gradient(135deg, #ffb038 50%, #14100a 50%);
}

.themes__swatch--midnight {
    background: linear-gradient(135deg, #7dd3fc 50%, #0d1220 50%);
}

.themes__swatch--paper {
    background: linear-gradient(135deg, #23211c 50%, #f6f5f1 50%);
}

.themes__swatch--synthwave {
    background: linear-gradient(135deg, #ff5ed2 50%, #1a0b2e 50%);
}
</style>
