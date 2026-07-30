<script setup>
import { computed } from 'vue'
import { clockParts, digitsOf, formatClock } from '@/core/time.js'

const props = defineProps({
    now: { type: Number, required: true },
    hasAlarm: { type: Boolean, default: false }
})

/**
 * Real seven-segment digits built from positioned DOM segments — no webfont,
 * fixed width by construction, and the unlit segments stay faintly visible
 * (--seg-off): the authentic ghosting.
 */
const SEGMENT_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
const LIT = {
    0: 'abcdef',
    1: 'bc',
    2: 'abged',
    3: 'abgcd',
    4: 'fgbc',
    5: 'afgcd',
    6: 'afgedc',
    7: 'abc',
    8: 'abcdefg',
    9: 'abcdfg'
}

const parts = computed(() => clockParts(props.now))
const hours = computed(() => digitsOf(parts.value.hours))
const minutes = computed(() => digitsOf(parts.value.minutes))
const seconds = computed(() => digitsOf(parts.value.seconds))

// The colon blinks on odd seconds and the PM lamp lights after noon, like the
// originals.
const colonOff = computed(() => new Date(props.now).getSeconds() % 2 === 1)
const pm = computed(() => new Date(props.now).getHours() >= 12)

function lit(digit, segment) {
    return LIT[digit].includes(segment)
}
</script>

<template>
    <div class="housing">
        <div class="window" role="timer" :aria-label="`Current time ${formatClock(now)}`">
            <div class="group group--big">
                <span v-for="(digit, i) in hours" :key="i" class="d" aria-hidden="true">
                    <i
                        v-for="s in SEGMENT_KEYS"
                        :key="s"
                        :class="[`seg--${s}`, { 'is-on': lit(digit, s) }]"
                    ></i>
                </span>
            </div>
            <div class="colon" :class="{ 'colon--off': colonOff }" aria-hidden="true">
                <i></i><i></i>
            </div>
            <div class="group group--big">
                <span v-for="(digit, i) in minutes" :key="i" class="d" aria-hidden="true">
                    <i
                        v-for="s in SEGMENT_KEYS"
                        :key="s"
                        :class="[`seg--${s}`, { 'is-on': lit(digit, s) }]"
                    ></i>
                </span>
            </div>
            <div class="group group--small">
                <span v-for="(digit, i) in seconds" :key="i" class="d" aria-hidden="true">
                    <i
                        v-for="s in SEGMENT_KEYS"
                        :key="s"
                        :class="[`seg--${s}`, { 'is-on': lit(digit, s) }]"
                    ></i>
                </span>
            </div>
        </div>
        <div class="lamps">
            <span class="lamp" :class="{ 'lamp--on': hasAlarm }"><i></i>ALARM</span>
            <span class="lamp" :class="{ 'lamp--on': pm }"><i></i>PM</span>
        </div>
    </div>
</template>

<style scoped>
.housing {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: 0 14px 34px rgb(0 0 0 / 25%);
    padding: 22px 26px;
}

.window {
    align-items: flex-end;
    background: var(--display);
    border: 1px solid var(--display-border);
    border-radius: 10px;
    display: flex;
    filter: var(--seg-glow);
    gap: 0.5em;
    padding: 22px 26px 18px;
    user-select: none;
}

.group {
    display: flex;
    gap: 0.28em;
}

.group--big {
    font-size: var(--seg-big, 64px);
}

.group--small {
    font-size: var(--seg-small, 34px);
    margin-left: 0.3em;
}

/* Seven-segment digits, em-sized so the seconds just use a smaller font. */
.d {
    display: block;
    height: 1.8em;
    position: relative;
    transform: skewX(-5deg);
    width: 1em;
}

.d i {
    background: var(--seg-off);
    border-radius: 0.04em;
    position: absolute;
}

.seg--a {
    height: 0.2em;
    left: 0.12em;
    right: 0.12em;
    top: 0;
}

.seg--g {
    height: 0.2em;
    left: 0.12em;
    right: 0.12em;
    top: 0.8em;
}

.seg--d {
    bottom: 0;
    height: 0.2em;
    left: 0.12em;
    right: 0.12em;
}

.seg--f {
    height: 0.72em;
    left: 0;
    top: 0.1em;
    width: 0.2em;
}

.seg--b {
    height: 0.72em;
    right: 0;
    top: 0.1em;
    width: 0.2em;
}

.seg--e {
    bottom: 0.1em;
    height: 0.72em;
    left: 0;
    width: 0.2em;
}

.seg--c {
    bottom: 0.1em;
    height: 0.72em;
    right: 0;
    width: 0.2em;
}

.d i.is-on {
    background: var(--seg-on);
}

.colon {
    display: flex;
    flex-direction: column;
    font-size: var(--seg-big, 64px);
    gap: 0.5em;
    height: 1.8em;
    justify-content: center;
    padding: 0 0.05em;
}

.colon i {
    background: var(--seg-on);
    border-radius: 50%;
    height: 0.16em;
    width: 0.16em;
}

.colon--off i {
    background: var(--seg-off);
}

.lamps {
    color: var(--muted);
    display: flex;
    font-size: 0.7rem;
    gap: 1.2rem;
    letter-spacing: 0.14em;
    margin-top: 12px;
}

.lamp {
    align-items: center;
    display: flex;
    gap: 0.4rem;
}

.lamp i {
    background: var(--seg-off);
    border-radius: 50%;
    height: 8px;
    width: 8px;
}

.lamp--on i {
    background: var(--seg-on);
    filter: var(--seg-glow);
}
</style>
