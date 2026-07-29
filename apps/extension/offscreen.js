/**
 * Audio host for Chrome. Driven entirely by messages from the background
 * worker; it has no UI and no state beyond the element itself.
 */

const audio = new Audio(chrome.runtime.getURL('sounds/alarm-clock.mp3'))

audio.loop = true

chrome.runtime.onMessage.addListener((message) => {
    if (message?.target !== 'offscreen') return

    if (message.type === 'PLAY') {
        audio.currentTime = 0
        audio.play().catch(() => {})
    }

    if (message.type === 'STOP') {
        audio.pause()
        audio.currentTime = 0
    }
})
