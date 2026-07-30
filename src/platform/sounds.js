/**
 * Per-theme WebAudio ring patterns, ported from each design prototype's
 * beep() (design/*.html). Web only — in the extension the background worker
 * owns playback and keeps its single alarm sound.
 *
 * The basic theme has no recipe here; it keeps its mp3 (see web.js).
 */

const RECIPES = {
    // Two short square beeps, like a mechanical board buzzer.
    'split-flap': {
        interval: 1000,
        beep(ctx) {
            for (const dt of [0, 0.25]) {
                tone(ctx, { type: 'square', freq: 880, at: dt, gain: 0.1, ramp: 0.15, stop: 0.2 })
            }
        }
    },

    // The authentic harsh pulsing buzzer.
    'retro-led': {
        interval: 800,
        beep(ctx) {
            for (const dt of [0, 0.12, 0.24, 0.36]) {
                tone(ctx, { type: 'square', freq: 820, at: dt, gain: 0.11, cut: 0.08, stop: 0.09 })
            }
        }
    },

    terminal: {
        interval: 500,
        beep(ctx) {
            tone(ctx, { type: 'square', freq: 1040, gain: 0.09, ramp: 0.12, stop: 0.15 })
        }
    },

    // Crisp double-strike bell.
    station: {
        interval: 900,
        beep(ctx) {
            for (const dt of [0, 0.18]) {
                tone(ctx, { type: 'sine', freq: 1200, at: dt, gain: 0.16, ramp: 0.25, stop: 0.3 })
            }
        }
    },

    // Gentle ramp: soft sine chime whose volume grows over the first 30s.
    nocturne: {
        interval: 1600,
        beep(ctx, elapsed) {
            const gain = Math.min(0.15, 0.02 + (elapsed / 30_000) * 0.13)

            tone(ctx, { type: 'sine', freq: 520, gain, ramp: 0.8, stop: 0.85 })
        }
    },

    // Cheerful major-third two-note chime, C5 then E5.
    riviera: {
        interval: 1100,
        beep(ctx) {
            tone(ctx, { type: 'sine', freq: 523.25, gain: 0.14, ramp: 0.3, stop: 0.35 })
            tone(ctx, { type: 'sine', freq: 659.25, at: 0.22, gain: 0.14, ramp: 0.3, stop: 0.35 })
        }
    }
}

/** One enveloped oscillator: `ramp` decays exponentially, `cut` hard-stops. */
function tone(ctx, { type, freq, at = 0, gain, ramp, cut, stop }) {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const start = ctx.currentTime + at

    osc.type = type
    osc.frequency.value = freq
    env.gain.setValueAtTime(gain, start)

    if (ramp) env.gain.exponentialRampToValueAtTime(0.001, start + ramp)
    if (cut) env.gain.setValueAtTime(0.0001, start + cut)

    osc.connect(env).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + stop)
}

export function hasRecipe(theme) {
    return theme in RECIPES
}

export function createRinger() {
    let ctx = null
    let timer = null

    function context() {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()

        return ctx
    }

    return {
        /** Must run inside a user gesture, or the context starts suspended. */
        unlock() {
            try {
                context().resume()
            } catch {
                // No WebAudio: the notification still fires; only sound is lost.
            }
        },

        start(theme) {
            const recipe = RECIPES[theme]

            if (!recipe || timer) return

            try {
                const audio = context()
                const startedAt = Date.now()
                const fire = () => recipe.beep(audio, Date.now() - startedAt)

                audio.resume()
                fire()
                timer = setInterval(fire, recipe.interval)
            } catch {
                // As above.
            }
        },

        stop() {
            clearInterval(timer)
            timer = null
        }
    }
}
