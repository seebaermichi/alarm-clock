/**
 * The clock tick, moved off the main thread.
 *
 * Chrome throttles main-thread timers in a hidden tab to roughly once a minute.
 * Worker timers are throttled far less, so the display stays honest while the
 * tab is in the background. Correctness does not depend on this — alarms fire
 * on a timestamp comparison, so even a badly throttled tick still rings — but
 * it keeps the visible clock from freezing.
 */

let interval = null

self.onmessage = ({ data }) => {
    if (data === 'start' && interval === null) {
        interval = setInterval(() => self.postMessage(Date.now()), 250)
    }

    if (data === 'stop') {
        clearInterval(interval)
        interval = null
    }
}
