<script setup>
import { onMounted, ref } from 'vue'
import { parseCommand } from '@/core/command.js'
import { nextOccurrence } from '@/core/alarm.js'
import { formatRingsIn } from '@/core/time.js'

const emit = defineEmits(['set-time', 'set-countdown', 'cancel-all'])

defineProps({
    error: { type: String, default: '' }
})

const HELP = [
    { kind: 'muted', text: 'set an alarm:  ' },
    { kind: 'ok', text: 'alarm 07:30' },
    { kind: 'muted', text: '  ·  ' },
    { kind: 'ok', text: 'alarm in 20m' },
    { kind: 'muted', text: '  ·  ' },
    { kind: 'ok', text: 'stop' }
]

/** Rendered as spans, never as HTML — the input is the user's to type. */
const log = ref([[{ kind: 'prompt', text: '$ ' }, { kind: 'plain', text: 'alarm --help' }], HELP])
const command = ref('')
const input = ref(null)

function logLine(...segments) {
    log.value = [...log.value, segments].slice(-8)
}

function ok(text) {
    logLine({ kind: 'ok', text: 'ok' }, { kind: 'plain', text: ` — ${text}` })
}

function submit() {
    const value = command.value.trim()

    command.value = ''

    const parsed = parseCommand(value)

    if (!parsed) return

    logLine({ kind: 'prompt', text: '$ ' }, { kind: 'plain', text: value })

    switch (parsed.type) {
        case 'at':
            emit('set-time', parsed.hhmm)
            ok(`rings in ${formatRingsIn(nextOccurrence(parsed.hhmm) - Date.now())}`)
            break
        case 'in':
            emit('set-countdown', parsed.minutes)
            ok(`rings in ${formatRingsIn(parsed.minutes * 60_000)}`)
            break
        case 'stop':
            emit('cancel-all')
            ok('alarm cleared')
            break
        case 'help':
            logLine(...HELP)
            break
        default:
            logLine({ kind: 'muted', text: 'unknown — try: alarm 07:30 · alarm in 20m · stop' })
    }
}

onMounted(() => input.value?.focus())
</script>

<template>
    <section class="controls" aria-label="Alarm">
        <div class="controls__log" aria-live="polite">
            <p v-for="(line, i) in log" :key="i" class="controls__line">
                <span
                    v-for="(segment, j) in line"
                    :key="j"
                    :class="`controls__seg--${segment.kind}`"
                >{{ segment.text }}</span>
            </p>
        </div>

        <form class="controls__cmd" @submit.prevent="submit">
            <span class="controls__seg--prompt" aria-hidden="true">$</span>
            <!-- The invisible mirror is exactly as wide as the typed text, so
                 the block cursor sits where the next character will land. It
                 replaces the native caret (caret-color: transparent). -->
            <span class="controls__entry">
                <input
                    ref="input"
                    v-model="command"
                    class="controls__input"
                    autocomplete="off"
                    spellcheck="false"
                    aria-label="Command"
                    placeholder="alarm 07:30"
                />
                <span class="controls__mirror" aria-hidden="true">{{ command }}</span>
                <span class="controls__cursor" aria-hidden="true"></span>
            </span>
        </form>

        <p v-if="error" class="controls__error" role="alert">{{ error }}</p>
    </section>
</template>

<style scoped>
.controls {
    align-items: stretch;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
}

.controls__log {
    font-size: 0.95rem;
    line-height: 1.8;
    white-space: pre-wrap;
}

.controls__seg--prompt,
.controls__seg--muted {
    color: var(--muted);
}

.controls__seg--ok {
    color: var(--digit);
    font-weight: 700;
}

.controls__cmd {
    align-items: center;
    display: flex;
    font-size: 0.95rem;
    gap: 0.5rem;
}

.controls__entry {
    align-items: center;
    display: flex;
    flex: 1;
    height: 1.5em;
    position: relative;
}

.controls__input {
    background: none;
    border: 0;
    caret-color: transparent;
    color: var(--text);
    inset: 0;
    outline: none;
    position: absolute;
    width: 100%;
}

.controls__mirror {
    visibility: hidden;
    white-space: pre;
}

.controls__cursor {
    animation: blink 1.1s steps(1) infinite;
    background: var(--digit);
    display: inline-block;
    height: 1.1em;
    pointer-events: none;
    width: 0.6em;
}

.controls__error {
    color: var(--danger);
}

@keyframes blink {
    50% {
        opacity: 0.15;
    }
}
</style>
