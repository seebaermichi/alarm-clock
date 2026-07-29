/**
 * Audio host for Chrome. A Chrome MV3 service worker has no DOM and cannot
 * play sound, so this invisible document holds the <audio> element.
 *
 * It drives itself from storage rather than waiting to be told what to do.
 * The worker creates this document at the moment an alarm rings, and
 * createDocument() resolves as soon as the document exists — not once this
 * script has run. Anything messaged in that window arrives before a listener
 * is registered and is simply lost, which is exactly how the alarm ended up
 * ringing silently. Reading the current state on load cannot race.
 */

const audio = new Audio(chrome.runtime.getURL('sounds/alarm-clock.mp3'))

audio.loop = true

async function sync() {
    const { ringing } = await chrome.storage.local.get('ringing')

    if (ringing) {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
    }

    audio.pause()
    audio.currentTime = 0
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.ringing) sync()
})

sync()
