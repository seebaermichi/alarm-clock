# ToDo — Alarm Clock rebuild

Rebuild this fork into a single-page alarm clock with themes, plus a browser extension.
Full reasoning lives in the approved plan; this file is the working checklist.

**Decisions:** Vite (not Vue CLI) · Vue 3 kept · wall-clock *and* countdown alarms · Chrome + Edge + Firefox.

---

## Why this is a rebuild and not a patch

The live app is **`origin/enable-alarm-clock`**, not `main` — `main` has no alarm at all. Two confirmed bugs there share one root cause:

| # | Bug | Cause |
|---|-----|-------|
| 1 | **Alarm silently never rings in a background tab** | `checkAlarm()` matches the *string* `` `${hours}:${minutes}` `` on a 1s `setInterval`. Chrome throttles background timers to ~1/min, so the matching minute is skipped and the alarm is lost forever. |
| 2 | **Snooze silently cancels the alarm** | `snoozeAlarm()` passes a **Number** to `setLeadingZero()`, which tests `digit.length < 2` — `undefined < 2` is `false`. Stores `"9:5"` instead of `"09:05"`, which can never match. |

Root cause of both: **time is compared as formatted text instead of as an instant.**
The fix: store alarms as absolute epoch timestamps and fire on `Date.now() >= target`. Throttling then makes an alarm *late*, never *silent*.

The Netlify `/clock` 404 disappears by design — there will only be `/`.

---

## Architecture

`src/platform/` is an adapter interface implemented twice (web / extension).
**Rule: UI components never touch `chrome.*`, `localStorage`, `Notification` or `Audio` directly.** They call the injected adapter. This is what lets one Vue codebase serve the web app, the extension popup and the background worker.

```
src/
  core/         pure JS, no DOM, no browser APIs — the unit-tested heart
    time.js         formatting, padding, digit splitting
    alarm.js        nextOccurrence(hhmm, now), fromCountdown(mins, now), snooze(now, mins)
    themes.js       the 5 theme definitions
  ui/           shared Vue SFCs (Composition API, <script setup>)
  composables/  useClock.js, useAlarms.js
  platform/     web.js | extension.js — same interface, different guts
  styles/       themes.scss, base.scss
apps/
  web/          index.html, main.js
  extension/    manifest.json, background.js, offscreen.html, popup.html, main.js
```

---

## Phase 0 — Foundation

- [x] **1.** Create this `ToDo.md`.
- [x] **2.** Preserve the working version: `origin/enable-alarm-clock` fast-forward-merged into `main` (no conflicts — the merge base *was* `main`'s head). **Work happens directly on `main` from here; no feature branches.** `main` is currently 4 commits ahead of `origin/main` and unpushed.
- [x] **3.** Scaffold Vite + Vue 3. Remove `@vue/cli-service`, babel, `core-js`, `vue-router`.
- [x] **4.** Port `.prettierrc` conventions (4-space indent, single quotes, no semicolons) to ESLint flat config + Prettier 3. Delete the `eslintConfig` block from `package.json` and `babel.config.js`.
- [x] **5.** Relocate assets: `src/assets/fonts/*`, `public/*` icons, and `public/sounds/alarm-clock.mp3` (**only exists on the alarm branch**).

## Phase 1 — Core logic (pure, testable)

- [x] **6.** `core/time.js` — padding and digit splitting, type-safe against the Number-vs-String trap that caused bug #2.
- [x] **7.** `core/alarm.js` — returns **timestamps only**:
  - `nextOccurrence(hhmm, now)` — must roll to *tomorrow* when the time has already passed today (the current code has no concept of this)
  - `fromCountdown(minutes, now)`
  - `snooze(now, minutes)` — default 9
  - dedupe (currently every "Set" click pushes a duplicate)
- [x] **8.** Add Vitest; unit-test the above.
- [x] **9.** **Regression-test both bugs**: a coarse/skipped tick must still fire; snooze at a single-digit hour *and* minute must produce a valid firing timestamp.
- [x] **10.** `core/themes.js` — the five theme definitions.

## Phase 2 — Single-page UI

- [x] **11.** Delete `src/router/`, `views/Home.vue`, `views/NotFound.vue`, `views/Clock.vue`, `components/BaseButton.vue`. `App.vue` becomes the clock.
- [x] **12.** `ClockDigit.vue` + `ClockDisplay.vue` — **keep the ghost-`8` trick** (a dim `8` behind each digit stops the proportional LCD font jittering). Drop `ClockDigit`'s dead `computed` block referencing a nonexistent `this.digits`, and its stray `console.log`.
- [x] **13.** `AlarmControls.vue` — wall-clock input *and* countdown input.
- [x] **14.** `AlarmList.vue` — pending alarms, each individually cancellable.
- [x] **15.** `RingingOverlay.vue` — Snooze / Stop.
- [x] **16.** `ThemePicker.vue` + persistence via the platform adapter.
- [x] **17.** `styles/themes.scss` — five themes as CSS custom properties (`--bg`, `--digit`, `--digit-ghost`, `--accent`, `--danger`, `--surface`, `--border`, `--glow`) under `:root[data-theme="…"]`. Responsive layout. Default follows `prefers-color-scheme`; glow gated behind `prefers-reduced-motion`.

  | id | look |
  |----|------|
  | `lcd` | classic phosphor green on near-black |
  | `amber` | warm Nixie orange |
  | `midnight` | low-contrast slate/cyan, for night |
  | `paper` | light minimal, for daytime desks |
  | `synthwave` | magenta-cyan neon glow |

## Phase 3 — Reliability (the actual bug fixes)

- [x] **18.** Fire on absolute timestamps — `Date.now() >= target`. **This is the fix for bug #1.**
- [x] **19.** Move ticking into a **Web Worker** (throttled far less than main-thread timers).
- [x] **20.** Notification API so the alert escapes a hidden tab; request permission when the first alarm is set.
- [x] **21.** **Unlock audio on that same click** — autoplay policy blocks a bare `.play()` later. Loop while ringing; reset `currentTime` on stop (current `stopAlarm()` doesn't, so the next ring resumes mid-file).
- [x] **22.** Catch up on `visibilitychange` / `focus`, surfacing "this alarm fired while you were away" instead of swallowing it.
- [x] **23.** **Verify:** rang correctly from a hidden tab (1-min countdown, tab backgrounded), late by <2s. Snooze re-armed at exactly +9:00; Stop silenced and reset. **Still worth doing yourself:** the harsher case of a fully minimised window over several minutes.

## Phase 4 — Extension

- [x] **24.** Build the `platform/` adapter seam; refactor UI to depend only on it.
- [x] **25.** Add `vite-plugin-web-extension` + a second build config. *(Chosen over CRXJS for its `browser` option — needed for the Firefox variant.)*
- [x] **26.** MV3 `manifest.json` + background service worker on **`chrome.alarms`** — fires with the popup closed and the browser idle. Note Chrome clamps to a ~30s minimum; sub-minute countdowns fall back to `setTimeout`.
- [x] **27.** Audio: MV3 service workers **cannot play sound**. Chrome needs an offscreen document (`chrome.offscreen`, reason `AUDIO_PLAYBACK`); Firefox has no such API and plays from its background page — two adapter impls behind one `playAlarm()`.
- [x] **28.** `chrome.notifications` with **Snooze / Stop** action buttons, so it's actionable without opening the popup.
- [x] **29.** Persist alarms + theme in `chrome.storage`.
- [x] **30.** Toolbar badge counting down to the next alarm.
- [x] **31.** Firefox variant: `browser_specific_settings.gecko.id`, `webextension-polyfill`, separate build target.
- [x] **32.** Self-host or drop the Google-hosted `Bitter` webfont — MV3's default CSP blocks remote fonts. (`digital-7` is already local.)
- [x] **33.** Verified end to end in **both** Chrome and Firefox — rings with the popup closed, sound plays, countdown badge updates (notification action buttons on Chrome only; Firefox does not support them). Firefox worked even while Chrome was silent, since it plays from its background page and never touches the offscreen document.

## Phase 5 — Ship

- [x] **34.** `netlify.toml` — build command + `dist` publish dir.
- [x] **35.** Fill in `site.webmanifest` (`name`/`short_name` are currently empty strings). Fix the page title — `<%= htmlWebpackPlugin.options.title %>` and `<%= BASE_URL %>` are webpack-only and break under Vite.
- [x] **36.** Generate extension icons from the existing PNGs.
- [x] **37.** Rewrite `README.md` (currently stock Vue CLI boilerplate).
- [x] **38.** Update `CLAUDE.md` for the new architecture.

---

## Verification

- `npm run test` — Vitest over `core/`, including the task 9 regression tests.
- `npm run dev` — wall-clock and countdown alarms both ring; snooze re-rings after 9 min; stop silences and resets.
- **The one that matters:** alarm ~2 min out, switch tabs and keep working → must ring with a system notification. Repeat with the window minimized.
- `npm run build:extension` → load unpacked in Chrome and Firefox: set an alarm, **close the popup**, confirm it still fires with working Snooze/Stop notification buttons and a counting-down badge.
- Cycle all five themes in web and popup; the choice survives a reload.
