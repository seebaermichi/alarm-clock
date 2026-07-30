<script setup>
import { THEMES } from '@/core/themes.js'

defineProps({
    theme: { type: String, required: true }
})

defineEmits(['select'])
</script>

<template>
    <!-- One compact control instead of a swatch per theme: seven buttons in
         the header outgrew it once themes stopped being colour swaps. -->
    <select
        class="themes"
        :value="theme"
        aria-label="Theme"
        @change="$emit('select', $event.target.value)"
    >
        <option v-for="option in THEMES" :key="option.id" :value="option.id" :title="option.hint">
            {{ option.label }}
        </option>
    </select>
</template>

<style scoped>
.themes {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    cursor: pointer;
    padding: 0.4rem 0.9rem;
}
</style>
