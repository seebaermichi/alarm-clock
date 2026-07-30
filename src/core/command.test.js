import { describe, it, expect } from 'vitest'
import { parseCommand } from './command.js'

describe('parseCommand', () => {
    it('parses an absolute time, normalising the padding', () => {
        expect(parseCommand('alarm 07:30')).toEqual({ type: 'at', hhmm: '07:30' })
        expect(parseCommand('alarm 7:30')).toEqual({ type: 'at', hhmm: '07:30' })
    })

    it('rejects impossible clock times', () => {
        expect(parseCommand('alarm 25:00')).toEqual({ type: 'unknown' })
        expect(parseCommand('alarm 12:75')).toEqual({ type: 'unknown' })
    })

    it('parses countdowns in minutes and hours', () => {
        expect(parseCommand('alarm in 20m')).toEqual({ type: 'in', minutes: 20 })
        expect(parseCommand('alarm in 2h')).toEqual({ type: 'in', minutes: 120 })
        expect(parseCommand('alarm in 2 h')).toEqual({ type: 'in', minutes: 120 })
        expect(parseCommand('alarm in 0m')).toEqual({ type: 'unknown' })
    })

    it('recognises stop and help', () => {
        expect(parseCommand('stop')).toEqual({ type: 'stop' })
        expect(parseCommand('help')).toEqual({ type: 'help' })
        expect(parseCommand('alarm --help')).toEqual({ type: 'help' })
    })

    it('returns null for empty input and unknown for gibberish', () => {
        expect(parseCommand('')).toBeNull()
        expect(parseCommand('   ')).toBeNull()
        expect(parseCommand('wake me up')).toEqual({ type: 'unknown' })
    })
})
