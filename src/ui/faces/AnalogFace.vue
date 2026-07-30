<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatClock } from '@/core/time.js'

const props = defineProps({
    now: { type: Number, required: true },
    variant: { type: String, required: true }
})

/**
 * Hand geometry per dial. Colours are var() references so each theme's token
 * block stays the single source of colour.
 */
const DIALS = {
    station: {
        hour: { y1: 104, y2: 48, width: 7, stroke: 'var(--hand)' },
        minute: { y1: 108, y2: 24, width: 5, stroke: 'var(--hand)' },
        second: { y1: 118, y2: 22, width: 2, stroke: 'var(--second)' },
        hub: [
            { r: 4.5, fill: 'var(--hand)' },
            { r: 2.4, fill: 'var(--second)' }
        ]
    },
    nocturne: {
        hour: { y1: 104, y2: 52, width: 5.5, stroke: 'var(--hand)' },
        minute: { y1: 108, y2: 28, width: 4, stroke: 'var(--hand)' },
        second: { y1: 114, y2: 24, width: 1.8, stroke: 'var(--second)' },
        hub: [{ r: 4, fill: 'var(--lume)' }]
    },
    riviera: {
        hour: { y1: 104, y2: 54, width: 7, stroke: 'var(--shape-2)' },
        minute: { y1: 106, y2: 28, width: 5, stroke: 'var(--shape-4)' },
        second: { y1: 112, y2: 26, width: 2, stroke: 'var(--shape-3)' },
        hub: [{ r: 4.5, fill: 'var(--dots)' }]
    }
}

const dial = computed(() => DIALS[props.variant] ?? DIALS.station)

// Station: 12 batons + 48 minute ticks.
const stationTicks = Array.from({ length: 60 }, (_, i) => ({
    angle: i * 6,
    baton: i % 5 === 0
}))

// Nocturne: 12 lume dots with a soft halo, quarters bigger.
const nocturneMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180
    const quarter = i % 3 === 0

    return {
        x: 100 + 80 * Math.sin(angle),
        y: 100 - 80 * Math.cos(angle),
        halo: quarter ? 9 : 5.5,
        dot: quarter ? 3.6 : 2.4
    }
})

// Riviera: quarters are shapes (in the template); the rest are dots.
const rivieraDots = Array.from({ length: 12 }, (_, i) => i)
    .filter((i) => i % 3 !== 0)
    .map((i) => {
        const angle = (i * 30 * Math.PI) / 180

        return { x: 100 + 82 * Math.sin(angle), y: 100 - 82 * Math.cos(angle) }
    })

// The `now` prop ticks too coarsely for a sweeping second hand, so the dial
// runs its own rAF loop with fractional seconds. Display only — alarm logic
// still keys off the shared clock.
const angles = ref({ hour: 0, minute: 0, second: 0 })
let frame = null

function sweep() {
    const date = new Date()
    const seconds = date.getSeconds() + date.getMilliseconds() / 1000
    const minutes = date.getMinutes() + date.getSeconds() / 60
    const hours = (date.getHours() % 12) + date.getMinutes() / 60

    angles.value = { hour: hours * 30, minute: minutes * 6, second: seconds * 6 }
    frame = requestAnimationFrame(sweep)
}

onMounted(() => {
    frame = requestAnimationFrame(sweep)
})

onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
    <svg
        class="dial"
        viewBox="0 0 200 200"
        role="timer"
        :aria-label="`Current time ${formatClock(now)}`"
    >
        <circle cx="100" cy="100" r="96" fill="var(--face)" stroke="var(--face-border)" stroke-width="1.5" />

        <g v-if="variant === 'station'">
            <line
                v-for="tick in stationTicks"
                :key="tick.angle"
                x1="100"
                y1="11"
                x2="100"
                :y2="tick.baton ? 29 : 17"
                stroke="var(--hand)"
                :stroke-width="tick.baton ? 6 : 1.6"
                :transform="`rotate(${tick.angle} 100 100)`"
            />
        </g>

        <g v-else-if="variant === 'nocturne'">
            <template v-for="(mark, i) in nocturneMarks" :key="i">
                <circle :cx="mark.x" :cy="mark.y" :r="mark.halo" fill="var(--lume-halo)" />
                <circle :cx="mark.x" :cy="mark.y" :r="mark.dot" fill="var(--lume)" />
            </template>
        </g>

        <g v-else>
            <!-- 12/3/6/9 as geometric shapes: circle, square, triangle, diamond. -->
            <circle cx="100" cy="18" r="6.5" fill="var(--shape-1)" />
            <rect x="176" y="94.5" width="11" height="11" fill="var(--shape-2)" />
            <polygon points="100,176 107,188 93,188" fill="var(--shape-3)" />
            <rect x="8" y="94.5" width="11" height="11" fill="var(--shape-4)" transform="rotate(45 13.5 100)" />
            <circle
                v-for="(dot, i) in rivieraDots"
                :key="i"
                :cx="dot.x"
                :cy="dot.y"
                r="2.4"
                fill="var(--dots)"
            />
        </g>

        <line
            x1="100"
            :y1="dial.hour.y1"
            x2="100"
            :y2="dial.hour.y2"
            :stroke="dial.hour.stroke"
            :stroke-width="dial.hour.width"
            stroke-linecap="round"
            :transform="`rotate(${angles.hour} 100 100)`"
        />
        <line
            x1="100"
            :y1="dial.minute.y1"
            x2="100"
            :y2="dial.minute.y2"
            :stroke="dial.minute.stroke"
            :stroke-width="dial.minute.width"
            stroke-linecap="round"
            :transform="`rotate(${angles.minute} 100 100)`"
        />

        <!-- Riviera's second hand carries its signature ring counterweight. -->
        <g v-if="variant === 'riviera'" :transform="`rotate(${angles.second} 100 100)`">
            <line
                x1="100"
                :y1="dial.second.y1"
                x2="100"
                :y2="dial.second.y2"
                :stroke="dial.second.stroke"
                :stroke-width="dial.second.width"
                stroke-linecap="round"
            />
            <circle cx="100" cy="117" r="5" fill="none" :stroke="dial.second.stroke" stroke-width="2" />
        </g>
        <line
            v-else
            x1="100"
            :y1="dial.second.y1"
            x2="100"
            :y2="dial.second.y2"
            :stroke="dial.second.stroke"
            :stroke-width="dial.second.width"
            stroke-linecap="round"
            :transform="`rotate(${angles.second} 100 100)`"
        />

        <circle v-for="(hub, i) in dial.hub" :key="i" cx="100" cy="100" :r="hub.r" :fill="hub.fill" />
    </svg>
</template>

<style scoped>
.dial {
    height: var(--dial-size, min(60vmin, 380px));
    width: var(--dial-size, min(60vmin, 380px));
    user-select: none;
}
</style>
