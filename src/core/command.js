/**
 * The Terminal theme's command grammar. Pure string parsing — the component
 * turns the result into alarm actions, this module only decides what was said.
 *
 *   alarm 07:30     -> { type: 'at', hhmm: '07:30' }
 *   alarm in 20m    -> { type: 'in', minutes: 20 }
 *   alarm in 2h     -> { type: 'in', minutes: 120 }
 *   stop            -> { type: 'stop' }
 *   help            -> { type: 'help' }
 *   anything else   -> { type: 'unknown' }
 */

import { parseTimeInput } from './alarm.js'
import { pad2 } from './time.js'

export function parseCommand(input) {
    const value = String(input ?? '').trim()

    if (!value) return null

    let match

    if ((match = /^alarm\s+(\d{1,2}):(\d{2})$/.exec(value))) {
        const parsed = parseTimeInput(`${match[1]}:${match[2]}`)

        if (!parsed) return { type: 'unknown' }

        return { type: 'at', hhmm: `${pad2(parsed.hours)}:${pad2(parsed.minutes)}` }
    }

    if ((match = /^alarm\s+in\s+(\d+)\s*(m|h)$/.exec(value))) {
        const amount = Number(match[1])

        if (amount <= 0) return { type: 'unknown' }

        return { type: 'in', minutes: match[2] === 'h' ? amount * 60 : amount }
    }

    if (value === 'stop') return { type: 'stop' }
    if (value === 'help' || value === 'alarm --help') return { type: 'help' }

    return { type: 'unknown' }
}
