/**
 * The background worker owns all alarm state.
 *
 * This is the whole reason the extension exists: browser.alarms fires with the
 * popup closed and the browser idle, which no web page can promise. The popup
 * is only a view — it sends commands here and mirrors what it reads back from
 * storage.
 */

import browser from 'webextension-polyfill'
import {
    addAlarm,
    removeAlarm,
    createAlarm,
    snooze,
    nextAlarm,
    DEFAULT_SNOOZE_MINUTES
} from '@/core/alarm.js'
import { formatClock } from '@/core/time.js'

const BADGE_TICK = 'badge-tick'
const ALARM_SOUND = 'sounds/alarm-clock.mp3'

const isChrome = typeof chrome !== 'undefined' && Boolean(chrome.offscreen)

async function getState() {
    const { alarms = [], ringing = null, theme = null } = await browser.storage.local.get([
        'alarms',
        'ringing',
        'theme'
    ])

    return { alarms, ringing, theme }
}

const setState = (patch) => browser.storage.local.set(patch)

// ---------------------------------------------------------------- scheduling

async function schedule(alarm) {
    // Already overdue — ring now rather than scheduling something in the past.
    if (alarm.at <= Date.now()) return ring(alarm)

    // Chrome silently rounds anything under 30s up to 30s. The UI's 1-minute
    // countdown floor and 9-minute snooze both stay clear of it, so this only
    // matters if those limits ever change.
    await browser.alarms.create(alarm.id, { when: alarm.at })
}

async function addAndSchedule(at) {
    if (!at) return

    const { alarms } = await getState()
    const alarm = createAlarm(at)
    const next = addAlarm(alarms, alarm)

    // addAlarm de-duplicates by instant; if nothing was added there is nothing
    // to schedule either.
    if (next.length === alarms.length) return

    await setState({ alarms: next })
    await schedule(alarm)
    await updateBadge()
}

async function cancel(id) {
    const { alarms } = await getState()

    await browser.alarms.clear(id)
    await setState({ alarms: removeAlarm(alarms, id) })
    await updateBadge()
}

// ------------------------------------------------------------------- ringing

async function ring(alarm) {
    const { alarms } = await getState()

    // Written before anything else: the offscreen document reads this on load
    // to decide whether to start playing, and the popup renders from it.
    await setState({
        alarms: removeAlarm(alarms, alarm.id),
        ringing: alarm
    })

    // Independent channels. A failure in one must not silence the others —
    // losing audio should never also cost you the notification.
    const results = await Promise.allSettled([playAlarm(), notify(alarm), updateBadge()])

    // allSettled swallows rejections by design, which is right for behaviour
    // and wrong for diagnosis. Surface them.
    results
        .filter((result) => result.status === 'rejected')
        .forEach((result, index) => {
            console.error(`[alarm-clock] ring channel ${index} failed`, result.reason)
        })
}

async function stopRinging() {
    // Clear state first; the offscreen document stops as soon as it sees this.
    await setState({ ringing: null })
    await Promise.allSettled([
        stopAlarm(),
        browser.notifications.clear('ringing'),
        updateBadge()
    ])
}

async function snoozeRinging(minutes = DEFAULT_SNOOZE_MINUTES) {
    await stopRinging()
    await addAndSchedule(snooze(Date.now(), minutes))
}

// --------------------------------------------------------------------- audio

async function ensureOffscreen() {
    try {
        // hasDocument() only exists from Chrome 116; the catch below covers
        // older versions, where creating a second document is what tells us
        // one already exists.
        if (await chrome.offscreen.hasDocument?.()) return

        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Play the alarm sound when an alarm fires.'
        })

        console.info('[alarm-clock] offscreen document created')
    } catch (error) {
        if (String(error).includes('single offscreen document')) return

        console.error('[alarm-clock] offscreen creation failed', error)
        await browser.storage.local.set({ audioError: `offscreen: ${error}` })
        throw error
    }
}

let firefoxAudio = null

async function playAlarm() {
    if (isChrome) {
        // Creating the document is the whole trigger: it starts playing on load
        // and has no state to consult. Note it may only use chrome.runtime, so
        // it could not consult storage even if we wanted it to.
        await ensureOffscreen()
        return
    }

    // Firefox: the background page has a DOM, so no offscreen document needed.
    firefoxAudio ??= new Audio(browser.runtime.getURL(ALARM_SOUND))
    firefoxAudio.loop = true
    firefoxAudio.currentTime = 0
    firefoxAudio.play().catch(() => {})
}

async function stopAlarm() {
    if (isChrome) {
        // Closing the document tears the <audio> element down with it.
        await chrome.offscreen.closeDocument().catch(() => {})
        return
    }

    if (firefoxAudio) {
        firefoxAudio.pause()
        firefoxAudio.currentTime = 0
    }
}

// ------------------------------------------------------------- notifications

async function notify(alarm) {
    const options = {
        type: 'basic',
        iconUrl: browser.runtime.getURL('icons/icon-128.png'),
        title: `Alarm — ${formatClock(alarm.at)}`,
        message: alarm.label || 'Time is up.'
    }

    // Firefox's notifications API supports neither action buttons nor
    // requireInteraction; sending them throws rather than degrading.
    if (isChrome) {
        options.buttons = [{ title: `Snooze ${DEFAULT_SNOOZE_MINUTES}m` }, { title: 'Stop' }]
        options.requireInteraction = true
    }

    await browser.notifications.create('ringing', options).catch(() => {})
}

// --------------------------------------------------------------------- badge

async function updateBadge() {
    const { alarms, ringing } = await getState()

    if (ringing) {
        await browser.action.setBadgeText({ text: '!' })
        await browser.action.setBadgeBackgroundColor({ color: '#ef4444' })
        return
    }

    const next = nextAlarm(alarms, Date.now())

    if (!next) {
        await browser.action.setBadgeText({ text: '' })
        return
    }

    const remaining = next.at - Date.now()
    const minutes = Math.ceil(remaining / 60_000)
    const text = minutes >= 60 ? `${Math.ceil(minutes / 60)}h` : `${minutes}m`

    await browser.action.setBadgeText({ text })
    await browser.action.setBadgeBackgroundColor({ color: '#22c55e' })
}

// ------------------------------------------------------------------ wiring

browser.alarms.onAlarm.addListener(async ({ name }) => {
    if (name === BADGE_TICK) {
        await updateBadge()
        return
    }

    const { alarms } = await getState()
    const alarm = alarms.find((item) => item.id === name)

    // Comparing against the stored list rather than trusting the alarm name
    // means a cancelled alarm that still fires is ignored.
    if (alarm) await ring(alarm)
})

browser.notifications.onButtonClicked.addListener(async (id, index) => {
    if (id !== 'ringing') return

    await (index === 0 ? snoozeRinging() : stopRinging())
})

browser.notifications.onClicked.addListener(async (id) => {
    if (id === 'ringing') await stopRinging()
})

browser.runtime.onMessage.addListener((message) => {
    // The offscreen document cannot log anywhere the user is likely to look,
    // so it forwards audio failures here instead.
    if (message?.type === 'AUDIO_ERROR') {
        console.error('[alarm-clock] offscreen audio failed —', message.message)
        return browser.storage.local.set({ audioError: message.message })
    }

    switch (message?.type) {
        case 'ADD_ALARM':
            return addAndSchedule(message.at)
        case 'CANCEL_ALARM':
            return cancel(message.id)
        case 'SNOOZE':
            return snoozeRinging(message.minutes)
        case 'STOP':
            return stopRinging()
        default:
            return undefined
    }
})

async function boot() {
    // Re-arm on startup: chrome.alarms survives a worker restart, but not an
    // extension update or a browser that was closed past the alarm time.
    const { alarms } = await getState()
    const now = Date.now()
    const overdue = alarms.filter((alarm) => alarm.at <= now)

    for (const alarm of alarms.filter((item) => item.at > now)) {
        await schedule(alarm)
    }

    // An alarm that came due while the browser was shut is late, not void.
    if (overdue.length) await ring(overdue[0])

    await browser.alarms.create(BADGE_TICK, { periodInMinutes: 1 })
    await updateBadge()

    console.info(
        `[alarm-clock] booted — audio path: ${isChrome ? 'offscreen (chrome)' : 'background page (firefox)'}`
    )
}

browser.runtime.onStartup.addListener(boot)
browser.runtime.onInstalled.addListener(boot)
boot()
