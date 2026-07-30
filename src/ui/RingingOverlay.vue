<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { snoozeMinutesFor } from '@/core/themes.js'
import BasicRing from './ringing/BasicRing.vue'
import SplitFlapRing from './ringing/SplitFlapRing.vue'
import RetroLedRing from './ringing/RetroLedRing.vue'
import TerminalRing from './ringing/TerminalRing.vue'
import StationRing from './ringing/StationRing.vue'
import NocturneRing from './ringing/NocturneRing.vue'
import RivieraRing from './ringing/RivieraRing.vue'

const props = defineProps({
    alarm: { type: Object, required: true },
    theme: { type: String, required: true },
    lateBy: { type: Number, default: 0 },
    firedWhileAway: { type: Boolean, default: false }
})

const emit = defineEmits(['snooze', 'stop'])

const OVERLAYS = {
    basic: BasicRing,
    'split-flap': SplitFlapRing,
    'retro-led': RetroLedRing,
    terminal: TerminalRing,
    station: StationRing,
    nocturne: NocturneRing,
    riviera: RivieraRing
}

const overlay = computed(() => OVERLAYS[props.theme] ?? BasicRing)
const snoozeMinutes = computed(() => snoozeMinutesFor(props.theme))

/**
 * Space snoozes, Q or Escape stops — on Nocturne *any* key snoozes, because
 * nobody hunts for the space bar in the dark. Handled here so every overlay
 * gets it; the component only exists while ringing, so the listener does too.
 */
function onKeydown(event) {
    if (event.key === 'q' || event.key === 'Q' || event.key === 'Escape') {
        emit('stop')
        return
    }

    if (props.theme === 'nocturne' || event.code === 'Space') {
        event.preventDefault()
        emit('snooze')
    }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
    <component
        :is="overlay"
        :alarm="alarm"
        :late-by="lateBy"
        :fired-while-away="firedWhileAway"
        :snooze-minutes="snoozeMinutes"
        @snooze="emit('snooze')"
        @stop="emit('stop')"
    />
</template>
