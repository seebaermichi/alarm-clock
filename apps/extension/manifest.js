/**
 * Manifest generator. Chrome and Firefox diverge on MV3 in ways that cannot be
 * expressed in one static file, so the differences are stated explicitly here
 * rather than hidden behind build-time string substitution.
 */

export default function manifest(target = 'chrome') {
    const isFirefox = target === 'firefox'

    const base = {
        manifest_version: 3,
        name: 'Alarm Clock',
        version: '1.0.0',
        description: 'A digital clock that rings at a set time or after a countdown.',
        permissions: ['alarms', 'storage', 'notifications'],
        action: {
            default_popup: 'popup.html',
            default_title: 'Alarm Clock'
        },
        icons: {
            192: 'android-chrome-192x192.png',
            512: 'android-chrome-512x512.png'
        }
    }

    if (isFirefox) {
        // Firefox runs MV3 background code as an event page with a DOM, so it
        // can play audio itself and has no offscreen API to ask for.
        base.background = { scripts: ['background.js'], type: 'module' }
        base.browser_specific_settings = {
            gecko: {
                id: 'alarm-clock@michael-becker-berlin.de',
                strict_min_version: '115.0'
            }
        }
    } else {
        // Chrome's MV3 service worker has no DOM and cannot play audio; the
        // offscreen document exists solely to hold the <audio> element.
        base.background = { service_worker: 'background.js', type: 'module' }
        base.permissions.push('offscreen')
    }

    return base
}
