# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser alarm clock, used daily to avoid missing meetings while working in other tabs. Forked from a Vue.js training exercise, now being rebuilt in place.

**An active rebuild is underway — read `ToDo.md` first.** It is the source of truth for the target architecture and the task order. This file describes the *current* state, which the rebuild is replacing.

Work happens **directly on `main`**; no feature branches.

## Current state (pre-rebuild)

Vue 3.5 + vue-router 4.5 on Vue CLI 5 (webpack). SCSS via `sass-loader`. No state library, no TypeScript, no `vue.config.js`.

```bash
npm install
npm run serve     # dev server
npm run build     # production build to dist/
npm run lint      # BROKEN — see below
```

**No test infrastructure exists** — no runner, no spec files, no `test` script. Don't reference or invent test commands. (Vitest arrives in task 8.)

Two known config defects, both fixed by ToDo task 4 — don't be surprised by them:
- `npm run lint` fails: `@vue/cli-plugin-eslint` is no longer in `devDependencies`, but the `lint` script still calls `vue-cli-service lint`.
- Two conflicting ESLint configs coexist: `.eslintrc.js` (the real one) and a stale `eslintConfig` block in `package.json` that names the uninstalled `babel-eslint` parser.

## Architecture

- `src/main.js` — creates the app, installs the router, imports the one global stylesheet.
- `src/router/index.js` — routes with eager static imports; `/:catchAll(.*)` must stay last. **Being deleted** — the rebuild is a single page.
- `src/components/DigitalClock.vue` — the whole app: clock display, alarm input, snooze/stop.
- `src/components/ClockDigit.vue` — renders a dim `8` behind each digit so the proportional LCD font doesn't jitter as numbers change. **Keep this trick.** Its `computed` block is dead code referencing a nonexistent `this.digits`.

### Two live bugs — the reason for the rebuild

Both stem from one root cause: **time is compared as formatted text rather than as an instant.**

1. `checkAlarm()` matches the string `` `${hours}:${minutes}` `` on a 1-second `setInterval`. Background tabs throttle timers to ~1/min, so the matching minute gets skipped and the alarm never rings — silently, forever.
2. `snoozeAlarm()` passes a **Number** into `setLeadingZero()`, which tests `digit.length < 2`; `undefined < 2` is `false`, so it stores `"9:5"` instead of `"09:05"`, which can never match. Snoozing silently cancels the alarm.

The fix is absolute epoch timestamps and `Date.now() >= target`, so throttling makes an alarm late rather than silent. Don't patch these in place — they're handled by the `core/alarm.js` rewrite in ToDo phase 1.

### Styling

Mixed and inconsistent: `DigitalClock.vue`'s `<style>` is **global**, `ClockDigit.vue`'s is **scoped**. Global class names are self-namespaced by component (`.digiclock-*`, `.timer-*`, `.clock-digit_*`) to avoid collisions.

`src/assets/main.scss` holds the reset, base typography, and the `@font-face` declarations for the local `digital-7` LCD fonts. `Bitter` is pulled from Google Fonts in `public/index.html` — this must become self-hosted or be dropped, since MV3's CSP blocks remote fonts in the extension.

## Conventions

- **Options API** in existing code (`data()`, `methods`, lifecycle hooks). New code in the rebuild uses **Composition API with `<script setup>`** — see `ToDo.md`.
- Timers start in `beforeMount`, clear in `beforeUnmount`.
- Formatting per `.prettierrc`: **4-space indent, single quotes, no semicolons.**
- Commit messages: short, lowercase, imperative ("add favicons", "fix typos, functionality").
