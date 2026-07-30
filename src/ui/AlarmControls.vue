<script setup>
import BasicControls from './controls/BasicControls.vue'
import SplitFlapControls from './controls/SplitFlapControls.vue'
import RetroLedControls from './controls/RetroLedControls.vue'
import TerminalControls from './controls/TerminalControls.vue'
import StationControls from './controls/StationControls.vue'
import NocturneControls from './controls/NocturneControls.vue'
import RivieraControls from './controls/RivieraControls.vue'

defineProps({
    theme: { type: String, required: true },
    error: { type: String, default: '' },
    upcoming: { type: Object, default: null }
})

defineEmits(['set-time', 'set-countdown', 'add-minutes', 'cancel-upcoming', 'cancel-all'])

/**
 * Each theme sets its alarm differently — steppers, hardware keys, a command
 * prompt, chips. All of them speak the same events; only the ones a component
 * declares are ever emitted.
 */
const CONTROLS = {
    basic: BasicControls,
    'split-flap': SplitFlapControls,
    'retro-led': RetroLedControls,
    terminal: TerminalControls,
    station: StationControls,
    nocturne: NocturneControls,
    riviera: RivieraControls
}
</script>

<template>
    <!-- Only Nocturne declares `upcoming` (its ARM toggle mirrors it); handing
         the object to the others would leak it into the DOM as an attribute. -->
    <component
        :is="CONTROLS[theme] ?? BasicControls"
        :error="error"
        :upcoming="theme === 'nocturne' ? upcoming : null"
        @set-time="$emit('set-time', $event)"
        @set-countdown="$emit('set-countdown', $event)"
        @add-minutes="$emit('add-minutes', $event)"
        @cancel-upcoming="$emit('cancel-upcoming')"
        @cancel-all="$emit('cancel-all')"
    />
</template>
