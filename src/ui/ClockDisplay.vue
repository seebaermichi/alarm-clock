<script setup>
import BasicFace from './faces/BasicFace.vue'
import FlipFace from './faces/FlipFace.vue'
import SevenSegFace from './faces/SevenSegFace.vue'
import TerminalFace from './faces/TerminalFace.vue'
import AnalogFace from './faces/AnalogFace.vue'

defineProps({
    now: { type: Number, required: true },
    theme: { type: String, required: true },
    hasAlarm: { type: Boolean, default: false }
})
</script>

<template>
    <!-- Each theme is a structurally different face, not a recolour, so the
         display dispatches to a per-theme component (design/README.md). -->
    <FlipFace v-if="theme === 'split-flap'" :now="now" />
    <SevenSegFace v-else-if="theme === 'retro-led'" :now="now" :has-alarm="hasAlarm" />
    <TerminalFace v-else-if="theme === 'terminal'" :now="now" />
    <AnalogFace
        v-else-if="theme === 'station' || theme === 'nocturne' || theme === 'riviera'"
        :now="now"
        :variant="theme"
    />
    <BasicFace v-else :now="now" />
</template>
