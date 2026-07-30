/**
 * Audio host for Chrome. A Chrome MV3 service worker has no DOM and cannot
 * play sound, so this invisible document holds the <audio> element.
 *
 * Critical constraint: an offscreen document may only use `chrome.runtime`.
 * `chrome.storage`, `chrome.alarms` and the rest are undefined here. An earlier
 * version read `ringing` from storage on load and died immediately with
 * "Cannot read properties of undefined (reading 'onChanged')" — before it ever
 * reached play(), which is why the alarm was silent with nothing logged.
 *
 * So this document carries no logic. Its existence *is* the instruction: the
 * worker creates it only when an alarm is ringing and closes it to stop. There
 * is no state to fetch and no message to race.
 */

const SOUND = 'sounds/alarm-clock.mp3'

const audio = new Audio(chrome.runtime.getURL(SOUND))

audio.loop = true

function report(stage, detail) {
    const message = `${stage}: ${detail}`

    console.error('[alarm-clock:offscreen]', message)

    // chrome.runtime is the one API available here, so it is also the only way
    // to get this into the worker's log where it is actually visible.
    try {
        const sending = chrome.runtime.sendMessage({ type: 'AUDIO_ERROR', message })

        if (sending?.catch) sending.catch(() => {})
    } catch {
        // No receiver; the console line above is still there.
    }
}

audio.addEventListener('error', () => {
    report('media', `code ${audio.error?.code} loading ${SOUND}`)
})

audio.play().catch((error) => {
    // NotAllowedError would mean Chrome blocked playback despite the
    // AUDIO_PLAYBACK reason; NotSupportedError points at the file itself.
    report('play', `${error?.name ?? 'Error'} — ${error?.message ?? error}`)
})
