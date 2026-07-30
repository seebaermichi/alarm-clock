import { describe, it, expect } from 'vitest'
import { formatClock } from './time.js'
import {
    parseTimeInput,
    shiftTimeInput,
    nextOccurrence,
    fromCountdown,
    snooze,
    createAlarm,
    addAlarm,
    removeAlarm,
    dueAlarms,
    nextAlarm
} from './alarm.js'

const at = (h, m, s = 0) => new Date(2026, 6, 29, h, m, s).getTime()

describe('parseTimeInput', () => {
    it('accepts HH:MM', () => {
        expect(parseTimeInput('14:30')).toEqual({ hours: 14, minutes: 30 })
        expect(parseTimeInput('9:05')).toEqual({ hours: 9, minutes: 5 })
    })

    it('rejects malformed and out-of-range input', () => {
        for (const bad of ['', 'abc', '25:00', '12:60', null, undefined]) {
            expect(parseTimeInput(bad)).toBeNull()
        }
    })
})

describe('nextOccurrence', () => {
    it('schedules later today when the time is still ahead', () => {
        expect(nextOccurrence('14:30', at(9, 0))).toBe(at(14, 30))
    })

    it('rolls to tomorrow when the time has already passed', () => {
        const result = nextOccurrence('08:00', at(9, 0))

        expect(result).toBeGreaterThan(at(9, 0))
        // Asserted on wall-clock hours rather than a fixed +86400000 offset,
        // so this stays correct across a DST boundary.
        expect(new Date(result).getHours()).toBe(8)
        expect(new Date(result).getDate()).toBe(30)
    })

    it('treats the current minute as passed rather than firing instantly', () => {
        const result = nextOccurrence('09:00', at(9, 0))

        expect(new Date(result).getDate()).toBe(30)
    })
})

describe('countdown and snooze', () => {
    it('schedules forward from now', () => {
        expect(fromCountdown(25, at(9, 0))).toBe(at(9, 25))
    })

    it('rejects non-positive and non-numeric durations', () => {
        expect(fromCountdown(0, at(9, 0))).toBeNull()
        expect(fromCountdown(-5, at(9, 0))).toBeNull()
        expect(fromCountdown('abc', at(9, 0))).toBeNull()
    })

    // REGRESSION — bug #2, end to end.
    // Snoozing at 09:05 used to store the string "9:5", which could never
    // match the zero-padded display and so silently cancelled the alarm.
    it('re-fires after snoozing at a single-digit hour and minute', () => {
        const now = at(9, 5)
        const snoozed = snooze(now)

        expect(formatClock(snoozed)).toBe('09:14')

        const alarms = addAlarm([], createAlarm(snoozed))

        expect(dueAlarms(alarms, snoozed)).toHaveLength(1)
    })
})

describe('alarm list', () => {
    it('ignores a duplicate scheduled for the same instant', () => {
        const target = at(14, 30)
        let alarms = addAlarm([], createAlarm(target))
        alarms = addAlarm(alarms, createAlarm(target))

        expect(alarms).toHaveLength(1)
    })

    it('keeps alarms sorted and removable', () => {
        let alarms = addAlarm([], createAlarm(at(16, 0)))
        alarms = addAlarm(alarms, createAlarm(at(10, 0)))

        expect(alarms.map((a) => formatClock(a.at))).toEqual(['10:00', '16:00'])
        expect(removeAlarm(alarms, alarms[0].id)).toHaveLength(1)
    })

    it('reports the soonest upcoming alarm', () => {
        let alarms = addAlarm([], createAlarm(at(16, 0)))
        alarms = addAlarm(alarms, createAlarm(at(10, 0)))

        expect(formatClock(nextAlarm(alarms, at(9, 0)).at)).toBe('10:00')
    })
})

describe('dueAlarms', () => {
    // REGRESSION — bug #1, the headline defect.
    // A background tab throttles setInterval to roughly once a minute, so the
    // exact minute an alarm was due gets skipped entirely. String matching lost
    // the alarm forever; comparing instants makes it merely late.
    it('still fires an alarm whose tick was skipped', () => {
        const target = at(14, 30)
        const alarms = addAlarm([], createAlarm(target))

        // Tab was frozen; the next tick lands 95 seconds late.
        const lateTick = target + 95_000

        expect(formatClock(lateTick)).not.toBe(formatClock(target))
        expect(dueAlarms(alarms, lateTick)).toHaveLength(1)
    })

    it('still fires after a very long freeze', () => {
        const target = at(14, 30)
        const alarms = addAlarm([], createAlarm(target))

        expect(dueAlarms(alarms, target + 3_600_000)).toHaveLength(1)
    })

    it('does not fire early', () => {
        const alarms = addAlarm([], createAlarm(at(14, 30)))

        expect(dueAlarms(alarms, at(14, 29, 59))).toHaveLength(0)
    })
})

describe('shiftTimeInput', () => {
    it('steps forward and back, zero-padded', () => {
        expect(shiftTimeInput('07:30', 5)).toBe('07:35')
        expect(shiftTimeInput('07:30', -5)).toBe('07:25')
        expect(shiftTimeInput('07:30', 60)).toBe('08:30')
    })

    it('wraps around midnight in both directions', () => {
        expect(shiftTimeInput('23:58', 5)).toBe('00:03')
        expect(shiftTimeInput('00:02', -5)).toBe('23:57')
    })

    it('returns unparseable input unchanged', () => {
        expect(shiftTimeInput('', 5)).toBe('')
        expect(shiftTimeInput('99:99', 5)).toBe('99:99')
    })
})
