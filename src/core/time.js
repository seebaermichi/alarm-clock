/**
 * Pure time formatting. No DOM, no browser APIs.
 *
 * Everything here coerces to String before measuring length. The original
 * snoozeAlarm() bug was `digit.length < 2` on a Number: `undefined < 2` is
 * false, so 9 came back as "9" instead of "09" and the alarm never matched.
 */

/** Pad a number or string to two digits. Accepts both on purpose. */
export function pad2(value) {
    return String(value).padStart(2, '0')
}

/** ['0', '9'] — for the per-digit clock display. */
export function digitsOf(value) {
    return pad2(value).split('')
}

/** Split a timestamp into padded clock parts. */
export function clockParts(timestamp) {
    const date = new Date(timestamp)

    return {
        hours: pad2(date.getHours()),
        minutes: pad2(date.getMinutes()),
        seconds: pad2(date.getSeconds())
    }
}

/** 'HH:MM' or 'HH:MM:SS' for a timestamp. */
export function formatClock(timestamp, { withSeconds = false } = {}) {
    const { hours, minutes, seconds } = clockParts(timestamp)

    return withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`
}

/**
 * Human countdown between two instants, e.g. '1:05:03' or '4:31'.
 * Clamps at zero — a due alarm reads '0:00', never a negative.
 */
export function formatDuration(ms) {
    const total = Math.max(0, Math.round(ms / 1000))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60

    return hours > 0
        ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
        : `${minutes}:${pad2(seconds)}`
}
