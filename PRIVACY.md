# Privacy Policy — Alarm Clock

_Last updated: 30 July 2026_

Alarm Clock is a browser extension and web app that rings at a wall-clock time
you set, or after a countdown you start.

## What is collected

**Nothing.**

Alarm Clock collects no personal data, sends no data anywhere, and contains no
analytics, tracking, advertising or telemetry of any kind. There is no server:
the extension makes no network requests at all.

## What is stored on your device

So that your alarms survive closing the popup and restarting the browser, the
extension saves the following locally, using the browser's own extension
storage (`chrome.storage.local`) — or, in the web app, `localStorage`:

- your pending alarms: an id, the time each is set for, and any label you typed
- which alarm is currently ringing, if one is
- your chosen theme and light/dark mode

All of it is created by you inside the extension. None of it is transmitted,
synced across devices, or readable by anyone but you. Uninstalling the
extension removes it, and clearing your browser data removes the web app's copy.

## What is not accessed

Alarm Clock has no content scripts and requests no host permissions. It cannot
read, modify or observe the pages you visit, your browsing history, your
downloads, your cookies, or anything else outside the extension itself.

The permissions it does request exist solely to make an alarm ring:

| Permission      | Why                                                                  |
| --------------- | -------------------------------------------------------------------- |
| `alarms`        | wake the extension at the moment you asked to be alerted             |
| `storage`       | keep your alarms and settings across browser restarts                |
| `notifications` | show the alert when the alarm is due and you're in another tab       |
| `offscreen`     | hold the audio element that plays the sound (Chrome/Edge only)       |

## Third parties

There are none. No data is sold, shared or transferred to anyone, for any
purpose.

## Changes

If this policy ever changes, the updated version will be published at this same
address with a new date above.

## Contact

Questions or concerns: <info@michael-becker-berlin.de>, or open an issue at
<https://github.com/seebaermichi/alarm-clock/issues>.
