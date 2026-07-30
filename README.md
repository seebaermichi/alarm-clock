# Alarm Clock

A digital clock that rings at a set time or after a countdown — built to not miss a meeting while you're working in other tabs.

Runs as a web app and as a browser extension. The extension is the reliable one: `browser.alarms` fires with the popup closed and the browser idle, which no web page can fully promise.

Five themes: LCD, Amber, Midnight, Paper, Synthwave.

## Development

```bash
npm install
npm run dev        # web app on localhost:5173
npm run build      # production build to dist/
npm run test       # unit tests (Vitest)
npm run lint       # ESLint
```

Requires **Node 20.19+ or 22.12+** (Vite 8). Netlify is pinned to Node 22 in `netlify.toml`.

> The web app's Vite config is `vite.config.web.js`, not the default `vite.config.js`. This is deliberate — see "Extension build" below.

## Extension

```bash
npm run build:extension           # -> dist-extension/chrome
npm run build:extension:firefox   # -> dist-extension/firefox
```

**Chrome / Edge:** `chrome://extensions` → enable Developer mode → **Load unpacked** → select `dist-extension/chrome`.
After any rebuild, click ↻ on the extension's card; Chrome does not auto-reload unpacked extensions.

**Firefox:** `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `dist-extension/firefox/manifest.json`. Temporary add-ons are dropped on restart.

## Architecture

```
src/
  core/         pure functions, no DOM or browser APIs — unit tested
  ui/           Vue SFCs, shared by the web page and the extension popup
  composables/  useClock, useAlarms (web), useExtensionAlarms (popup)
  platform/     web.js | extension.js — one interface, two implementations
  styles/       themes.scss (5 themes as CSS custom properties), base.scss
  workers/      ticker.js — off-main-thread clock tick
apps/
  web/          index.html, main.js
  extension/    manifest.js, background.js, popup.*, offscreen.*
```

Two rules hold this together:

1. **An alarm is an instant, never a formatted string.** Alarms are absolute epoch timestamps fired on `at <= now`. A skipped or throttled tick therefore makes an alarm *late*, never silent. Comparing formatted `HH:MM` strings is what made the original version fail in background tabs.
2. **UI components never touch `chrome.*`, `localStorage`, `Notification` or `Audio` directly.** Everything goes through `src/platform/`. That single seam is what lets one Vue UI serve the page, the popup and the background worker.

In the extension, the **background worker owns all alarm state**. The popup is only a view that sends commands and mirrors what it reads back from storage — anything it owned would die when you close it.

### Browser differences

| | Chrome / Edge | Firefox |
|---|---|---|
| Background | `service_worker` | `background.scripts` (event page) |
| Audio | offscreen document — the worker has no DOM | background page plays directly |
| Notification buttons | Snooze / Stop supported | unsupported; throws if sent |

An **offscreen document may only use `chrome.runtime`** — `chrome.storage` and every other extension API is undefined inside it. So it holds no logic: the worker creates it only while an alarm is ringing and closes it to stop. Its existence is the instruction.

### Extension build

`vite-plugin-web-extension` runs nested Vite builds that inherit none of the outer config, so plugins, aliases, root and outDir are all passed explicitly in `vite.config.extension.js`. The web config is named `vite.config.web.js` because Vite would auto-discover the default `vite.config.js` during those nested builds and apply the web app's root, breaking every entry path.

`web-ext-run` arrives with known advisories. They are dev-only, confined to the browser launcher used by the plugin's dev mode (disabled here), and never reach the shipped extension.

## Deployment

Netlify builds from `main` using `netlify.toml` (`npm run build` → `dist`, Node 22).

## Credits

Forked from a Vue.js training exercise by [EllyPirelly](https://github.com/EllyPirelly). The fixed-width digit trick — a dim `8` rendered behind each digit so the proportional LCD face doesn't jitter — is from the original.
