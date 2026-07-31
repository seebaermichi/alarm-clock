# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser alarm clock — rings at a wall-clock time or after a countdown — used daily to avoid missing meetings while working in other tabs. Ships as a web app (Netlify) and as a Chrome/Edge/Firefox extension.

Work happens **directly on `main`**; no feature branches. Remaining work is tracked in `ToDo.md`.

## Commands

```bash
npm run dev                       # web app dev server
npm run build                     # web -> dist/
npm run test                      # Vitest over src/**/*.test.js
npm run lint                      # ESLint 10 flat config
npm run build:extension           # -> dist-extension/chrome
npm run build:extension:firefox   # -> dist-extension/firefox
```

Node 20.19+ or 22.12+ (Vite 8 requirement). Netlify pins Node 22 via `netlify.toml`.

**The web Vite config is `vite.config.web.js`, not `vite.config.js`.** Renaming it back will break the extension build — Vite auto-discovers the default name during the extension plugin's nested builds and applies the web app's root, breaking every entry path. `npm run dev`/`build` pass `--config` explicitly.

Chrome does not auto-reload unpacked extensions: after `build:extension`, the card in `chrome://extensions` must be reloaded manually. Automation cannot reach `chrome://extensions`, so extension runtime behaviour can only be verified by the user.

## Two invariants

Both encode bugs that already happened. Don't undo them.

**1. An alarm is an instant, never a formatted string.** Alarms are absolute epoch timestamps in `src/core/alarm.js`, fired on `at <= now` (`dueAlarms`). The original code compared `` `${hours}:${minutes}` `` strings on a 1-second interval; background tabs throttle to ~1/min, the matching minute got skipped, and the alarm was lost silently and permanently. Timestamps make a missed tick *late*, never silent. `src/core/alarm.test.js` pins this.

**2. UI components never touch `chrome.*`, `localStorage`, `Notification` or `Audio` directly.** Everything goes through `src/platform/`. `App.vue` receives its platform via `inject('platform')` and gets its alarm store from `platform.createAlarms(now)`, because ownership genuinely differs between web and extension. Breaking this seam forks the codebase in two.

## Layout

```
src/core/         pure, no DOM, no browser APIs — the only unit-tested layer
src/ui/           Vue 3 SFCs, <script setup>, shared by web page and popup
src/ui/faces/     per-theme clock faces (ClockDisplay.vue dispatches on theme)
src/ui/controls/  per-theme alarm controls (AlarmControls.vue dispatches)
src/ui/ringing/   per-theme ringing overlays (RingingOverlay.vue dispatches)
src/composables/  useClock, useAlarms (web), useExtensionAlarms (popup), useTheme
src/platform/     web.js | extension.js — same interface, different guts
src/styles/       themes.scss, base.scss, popup.scss
src/workers/      ticker.js
apps/web/         index.html, main.js
apps/extension/   manifest.js, background.js, popup.*, offscreen.*
design/           the six theme prototypes + handoff README (reference, not built)
```

`src/core/` must stay free of browser APIs — it's what makes the logic testable in Node.

## Extension specifics

The **background worker owns all alarm state** (`browser.alarms` + `browser.storage.local`). The popup is a view: it sends commands and mirrors storage. Anything the popup owned would die when the user closes it, which is the whole reason the extension exists.

`src/platform/extension.js` is mostly deliberate no-ops (`playAlarm`, `notify`, `unlockAudio`) — that is correct, not unfinished.

**An offscreen document may only use `chrome.runtime`.** `chrome.storage` and every other extension API is `undefined` there. `apps/extension/offscreen.js` therefore holds no logic: the worker creates it only while an alarm rings and closes it to stop, so its existence is the instruction. A previous version read storage on load, threw on line 1, and produced a silent alarm with nothing logged. Do not add state lookups to it.

Chrome/Firefox divergence lives in `apps/extension/manifest.js`: `service_worker` vs `background.scripts`, the `offscreen` permission, `gecko.id`. Firefox notifications support neither action buttons nor `requireInteraction` and throw if sent, so those are attached only when `chrome.offscreen` exists.

`vite.config.extension.js` passes plugins, aliases, root and outDir to the plugin's nested builds explicitly — they inherit nothing.

## Status

Both extension targets verified working end to end: rings with the popup closed, sound plays, countdown badge updates (plus notification action buttons on Chrome, which Firefox does not support).

The six designer themes (design/README.md) are implemented in web and popup builds, and both are verified: web in-browser (faces, controls, ring overlays, persistence) and the extension popup at 380×460 after reloading the unpacked build.

Firefox worked throughout, including while Chrome was silent — it plays from its background page and never creates an offscreen document, so the `chrome.storage` fault could not reach it. Useful signal if the audio paths ever diverge again: a failure in one target says nothing about the other.

## Conventions

- Composition API with `<script setup>`. No Options API in current code.
- Formatting per `.prettierrc`: 4-space indent, single quotes, no semicolons. Run `npm run lint`.
- Themes are two axes on `<html>`: `data-theme` (basic · split-flap · retro-led · terminal · station · nocturne · riviera) picks a structurally different face/controls/ringing set, `data-mode` (dark · light) its variant. Both persisted via the platform; mode defaults from `prefers-color-scheme`. Token source of truth is the prototypes in `design/*.html`.
- No component hard-codes a colour; everything reads CSS custom properties from `styles/themes.scss`. Shared names (`--bg --surface --border --text --muted --digit --accent --accent-contrast --danger --danger-contrast --glow --font-ui --font-time`) exist in every theme×mode block; theme-structural extras are namespaced (`--sf-*`, `--seg-*`, `--face`/`--hand`, `--shape-*`…).
- Each theme ships its own WebAudio ring recipe (`src/platform/sounds.js`, web only — the extension worker keeps its mp3). Snooze is 9 min everywhere except Terminal's 5 (`snoozeMinutesFor`).
- Keep the ghost-`8` trick in `ClockDigit.vue` (a dim `8` behind each digit holds the glyph width so the proportional LCD font doesn't jitter). It, and the digital-7 font, now serve only the `basic` theme's face.
- Commit messages: short lowercase imperative subject; explain *why* in the body.
