import { describe, it, expect } from 'vitest'
import { pad2, digitsOf, formatClock, formatDuration } from './time.js'

describe('pad2', () => {
    it('pads single digits', () => {
        expect(pad2('9')).toBe('09')
        expect(pad2('05')).toBe('05')
    })

    // REGRESSION — bug #2, at its root.
    // The old setLeadingZero() tested `digit.length < 2`. On a Number, .length
    // is undefined and `undefined < 2` is false, so it returned 9 unpadded.
    it('pads Numbers, not just Strings', () => {
        expect(pad2(9)).toBe('09')
        expect(pad2(0)).toBe('00')
        expect(pad2(12)).toBe('12')
    })
})

describe('digitsOf', () => {
    it('always yields two characters', () => {
        expect(digitsOf(7)).toEqual(['0', '7'])
        expect(digitsOf(42)).toEqual(['4', '2'])
    })
})

describe('formatClock', () => {
    const at = new Date(2026, 6, 29, 9, 5, 3).getTime()

    it('zero-pads every part', () => {
        expect(formatClock(at)).toBe('09:05')
        expect(formatClock(at, { withSeconds: true })).toBe('09:05:03')
    })
})

describe('formatDuration', () => {
    it('formats minutes and hours', () => {
        expect(formatDuration(4 * 60_000 + 31_000)).toBe('4:31')
        expect(formatDuration(3_903_000)).toBe('1:05:03')
    })

    it('clamps overdue durations to zero rather than going negative', () => {
        expect(formatDuration(-5000)).toBe('0:00')
    })
})
