/**
 * Alarm scheduling. Pure functions over absolute epoch timestamps.
 *
 * The rule this module exists to enforce: an alarm is an *instant*, never a
 * formatted string. The old code compared `${hours}:${minutes}` against a list
 * of strings once a second, so when a background tab throttled its timer to
 * ~1/min the matching minute was skipped and the alarm was lost forever.
 *
 * Comparing `now >= alarm.at` instead makes a missed tick cause *lateness*,
 * never silence. That single change is the fix for the headline bug.
 */

const MINUTE_MS = 60_000

export const DEFAULT_SNOOZE_MINUTES = 9

/** Parse 'HH:MM' (the native <input type="time"> value). Null if malformed. */
export function parseTimeInput(value) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? '').trim())

    if (!match) return null

    const hours = Number(match[1])
    const minutes = Number(match[2])

    if (hours > 23 || minutes > 59) return null

    return { hours, minutes }
}

/**
 * The next instant at which the wall-clock reads `hhmm`.
 * Rolls to tomorrow when that time has already passed today — the old code
 * had no concept of this and would simply never fire.
 */
export function nextOccurrence(hhmm, now = Date.now()) {
    const parsed = parseTimeInput(hhmm)

    if (!parsed) return null

    const target = new Date(now)
    target.setHours(parsed.hours, parsed.minutes, 0, 0)

    if (target.getTime() <= now) {
        // setDate rather than +86400000: across a DST boundary a fixed
        // millisecond offset lands an hour off the intended wall-clock time.
        target.setDate(target.getDate() + 1)
    }

    return target.getTime()
}

/** An instant `minutes` from now. Used by the countdown input and by snooze. */
export function fromCountdown(minutes, now = Date.now()) {
    const value = Number(minutes)

    if (!Number.isFinite(value) || value <= 0) return null

    return now + Math.round(value * MINUTE_MS)
}

/** Snooze always measures forward from now, so it cannot land in the past. */
export function snooze(now = Date.now(), minutes = DEFAULT_SNOOZE_MINUTES) {
    return fromCountdown(minutes, now)
}

let idCounter = 0

/** Build an alarm record. `at` is an absolute timestamp. */
export function createAlarm(at, { label = '', kind = 'time' } = {}) {
    idCounter += 1

    return { id: `alarm-${at}-${idCounter}`, at, label, kind }
}

/**
 * Add an alarm, ignoring one already scheduled for the same instant.
 * The old setAlarm() pushed on every click, so holding Set queued duplicates
 * that all fired at once.
 */
export function addAlarm(alarms, alarm) {
    if (!alarm || alarms.some((existing) => existing.at === alarm.at)) {
        return alarms
    }

    return [...alarms, alarm].sort((a, b) => a.at - b.at)
}

export function removeAlarm(alarms, id) {
    return alarms.filter((alarm) => alarm.id !== id)
}

/**
 * Every alarm whose instant has arrived or passed.
 *
 * `<=` is load-bearing: after a throttled or frozen tab resumes, `now` can be
 * far beyond `at`. These alarms are overdue, not expired, and must still ring.
 */
export function dueAlarms(alarms, now = Date.now()) {
    return alarms.filter((alarm) => alarm.at <= now)
}

export function pendingAlarms(alarms, now = Date.now()) {
    return alarms.filter((alarm) => alarm.at > now)
}

/** The soonest upcoming alarm, for the countdown display and toolbar badge. */
export function nextAlarm(alarms, now = Date.now()) {
    return pendingAlarms(alarms, now).sort((a, b) => a.at - b.at)[0] ?? null
}
