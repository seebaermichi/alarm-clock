# Handoff: Six Clock Themes (Alarm Clock)

## Overview
Six complete visual themes for the existing Vue alarm-clock app (`michaelbecker/workspace/alarm-clock`), replacing the current color-swap themes with structurally different clock faces: 3 digital (Split-Flap, Retro LED, Terminal) and 3 analog (Station, Nocturne, Riviera). Every theme ships a **dark and light mode**, always shows **seconds**, and implements the full alarm lifecycle: set (at a time / in a while) → countdown → ring → snooze / stop.

## About the Design Files
The 6 HTML files in this folder are **design references created in HTML** — fully working, standalone prototypes (open any in a browser; the clock ticks, alarms ring with WebAudio, snooze works). They are NOT production code to copy verbatim. The task is to **recreate them inside the existing Vue app** (Vite + SCSS + scoped Vue SFCs) using its established patterns, and to reuse the same markup/CSS for the browser-extension build.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate pixel-perfectly.

## Architecture: how this maps onto the existing app

The app's current contract is `:root[data-theme=X]` → CSS custom properties; components never hard-code colors. Extend it with a second axis:

```
<html data-theme="split-flap" data-mode="dark">
```

- `data-theme` — one of `split-flap | retro-led | terminal | station | nocturne | riviera`
- `data-mode` — `dark | light`. Default from `prefers-color-scheme`, manual override persisted in `localStorage("clock-mode")`. Each HTML file's `<style>` starts with the exact variable blocks for both modes.
- Keep the shared var names the app already uses (`--bg --surface --border --text --muted --digit --accent --accent-contrast --danger --danger-contrast --glow`). Theme-structural extras are namespaced (`--sf-*` split-flap cards, `--seg-on/--seg-off/--seg-glow/--display/--key` retro-led, `--face/--hand/--second/--lume` analog, `--shape-1..4` riviera).
- **Unlike today, themes are not color-only**: `ClockDisplay.vue` must become a per-theme face component (e.g. `faces/FlipFace.vue`, `faces/SevenSegFace.vue`, `faces/TerminalFace.vue`, `faces/AnalogFace.vue` with per-theme dial config). Controls/ringing components stay shared but pick up per-theme structure noted below.
- The `digital-7` font and digit-ghost trick are no longer needed by any of these themes (Split-Flap uses fixed-width cards, Retro LED builds true seven-segment digits from DOM segments — fixed width by construction; Terminal is monospace).

## Themes

### 1. split-flap.html — digital
Departure-board flip cards. HH + MM as 92×132 px cards (84 px, weight 700), SS as smaller 56×82 px dim cards, seam line at 50 %. Dark: near-black board, off-white digits, amber accent `#e8a33d`. Light: ivory board `#eceae3`, white cards with `#d9d7cf` border, ink digits `#26262a`, amber `#d98f1f`.
- Set: −/+ steppers move the target in 5-min steps (also direct `<input type=time>`); SET is amber.
- Ring: full-screen black rail, blinking amber "WAKE UP", big time, SNOOZE 9 MIN (amber) / STOP (outline).
- Nice-to-have not in the prototype: a real flip animation on digit change (top half rotates `rotateX(-90deg)`, 150 ms, then bottom half completes; class hook `.card.is-flipping`).

### 2. retro-led.html — digital
A 1970s/80s bedside clock radio. Dark mode: plastic housing, black display window, glowing red seven-segment digits `#ff3b25` (CSS drop-shadow glow); light mode: gray LCD travel clock — segments `#2a3226` on `#c7cfb8`, no glow. Digits are **real seven-segment elements** (7 positioned `<i>` segments per digit, em-sized, skewX(-5deg)); unlit segments stay faintly visible (`--seg-off`) — the authentic ghosting, and it fixes digit width for free. Colon blinks on odd seconds; ALARM and PM indicator lamps under the display.
- Set: hardware-style HR/MIN plastic keys (−/+ hour, −/+ 5 min) plus the time field; SET is a red key.
- Ring: display blinks at 1 Hz, harsh pulsing 820 Hz square-wave buzzer, and the signature **giant SNOOZE bar** (min(480px, 84vw)); small "ALARM OFF" key below.
- No webfont: segments are DOM elements, so it's extension-safe.

### 3. terminal.html — digital
Keyboard-first console. Monospace stack (`SF Mono, Menlo, Consolas`). Dark: phosphor green `#58ff9e` on `#050805` with glow; light: solarized paper `#f4f3ea` / `#1f6b3f`, no glow.
- Set: a real command prompt — grammar `alarm 07:30`, `alarm in 20m`, `alarm in 2h`, `stop`; every action echoes a log line (`ok — rings in 9h 52m`).
- Ring: blinking inverse banner `!! ALARM 07:30 !!`; `[space] snooze 5m`, `[q] stop`. Snooze is 5 min here (terminal users are impatient).
- Ideal default for the extension new-tab page.

### 4. station.html — analog
Railway platform clock. SVG dial (viewBox 0 0 200 200, rendered at min(60vmin, 380px)): white face, 12 black batons (w=6, y 11→29), 48 minute ticks (w=1.6, y 11→17), black hands, thin red second hand `#d92b2b` with smooth sweep (rAF). Dark mode: charcoal face `#1e1f22` on `#141517`, off-white batons/hands, brighter red `#ff4d4d`.
- Set: pill tab switch (At a time / In a while) + time field + red Set — the quietest controls of the six. (Enhancement: make the red second hand draggable to set the minute.)
- Ring: page floods signal red, white time; **click anywhere snoozes**; white Snooze pill + ghost Stop.
- Sound: crisp 1200 Hz double-strike bell.

### 5. nocturne.html — analog
Luminous dial for dark rooms. Near-black face, 12 lume dots `#baffd2` with soft halo circles (quarters bigger), lume hands, dim orange second hand `#ff8c5a`. Light "Daybreak" mode: sage dots `#5f8a6e` on `#f9fbf7`.
- Set: night ergonomics — **no typing**: WAKE AT − 07:30 + steppers (5 min per tap, hold to auto-repeat), ARM toggle (armed state fills lume).
- Ring: gentle — screen slowly brightens (20 s `filter:brightness` ramp), soft 520 Hz sine chime whose volume grows over 30 s; **the entire screen is the snooze target**, stop is a small underlined link.

### 6. riviera.html — analog
Mid-century geometric play. Cream face; 12/3/6/9 are colored shapes (orange circle, teal square, mustard triangle, rust diamond), other hours small dots; teal hour hand, rust minute hand, mustard second hand with ring counterweight. Dark "Ink" mode: same shapes (brightened) on midnight blue `#202836`/`#171c26`.
- Set: additive quick-chips (+10 min / +30 min / +1 h stack onto the current alarm) plus absolute time field; teal Set.
- Ring: "Good morning!" card, the four marker shapes bounce (staggered 1 s), mustard Snooze / rust-outline Stop. Sound: cheerful C5→E5 sine chime. (Enhancement: confetti on Stop.)

## Interactions & Behavior (shared across all six)
- Tick loop: digital themes update per second via `setTimeout(1000 - ms)`; analog themes run `requestAnimationFrame` with fractional seconds for a smooth sweep.
- Alarm set at a past time rolls to tomorrow. "In a while" = now + N minutes.
- Countdown line under the clock: `Alarm 07:30 — rings in 9h 52m`, updated every second.
- Ring trigger: `now >= alarm` while not already ringing. Ringing = `body.is-ringing` shows a fixed full-screen overlay (`role="alertdialog"`).
- Snooze = 9 min (5 min on Terminal). Keyboard while ringing: Space = snooze, Q/Esc = stop (Nocturne: any key snoozes).
- Audio: WebAudio oscillators, unlocked by the set-button user gesture (as the app already does). Per-theme sound recipes are in each file's `beep()`.
- Mode switch: header toggle, persisted; respects `prefers-color-scheme` on first load; `prefers-reduced-motion` kills pulse/blink/bounce animations (media query present in every file).
- Transitions: background/color 0.3 s ease on mode/theme change.

## State Management
`alarm: Date|null`, `ringing: boolean`, `mode: 'dark'|'light'`, `theme: string`, plus per-theme input state (wake minutes on Nocturne, command log on Terminal). Persist `mode`, `theme`, and the armed alarm (the existing app's store applies).

## Browser extension notes
- All themes are dependency-free, single-file, no network requests → safe for MV3 `chrome_url_overrides.newtab` (no remote fonts: system stacks only — Helvetica Neue, SF Mono/Menlo, Courier New).
- New-tab pages can't autoplay audio without a gesture; the AudioContext-on-set pattern already handles this. For alarms that must fire with the tab closed, use `chrome.alarms` + a notification instead of WebAudio.
- `localStorage` works per-extension; swap to `chrome.storage.sync` if settings should roam.

## Design Tokens
Every file's `<style>` opens with the complete dark + light token blocks — treat those as the source of truth. Shared scale: radius 8–12 px (999 px pills), controls padding ~0.4–0.75 rem, header 1.25/1.5 rem, base font 16 px system/theme stack.

## Assets
None — no images, no icon fonts, no webfonts. Dials are inline SVG primitives; digits are styled text.

## Files
- `split-flap.html` — digital, flip cards (dark + light)
- `retro-led.html` — digital, seven-segment LED / LCD (dark + light)
- `terminal.html` — digital, command-line (dark + light)
- `station.html` — analog, railway dial (light + dark)
- `nocturne.html` — analog, luminous night dial (dark + light)
- `riviera.html` — analog, geometric shapes (light + dark)

Each is standalone and runnable — open in a browser to inspect exact rendering and behavior before porting.
