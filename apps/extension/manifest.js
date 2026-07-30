/**
 * Manifest generator. Chrome and Firefox diverge on MV3 in ways that cannot be
 * expressed in one static file, so the differences are stated explicitly here
 * rather than hidden behind build-time string substitution.
 */

const ICONS = {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png'
}

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
            default_title: 'Alarm Clock',
            default_icon: ICONS
        },
        // Declared at the sizes the browser actually asks for. Shipping only
        // the 192/512 favicons left Chrome downscaling a large PNG for a 16px
        // toolbar slot.
        icons: ICONS
    }

    if (isFirefox) {
        // Firefox runs MV3 background code as an event page with a DOM, so it
        // can play audio itself and has no offscreen API to ask for.
        base.background = { scripts: ['background.js'], type: 'module' }
        base.browser_specific_settings = {
            gecko: {
                id: 'alarm-clock@michael-becker-berlin.de',
                strict_min_version: '115.0',
                // AMO rejects new submissions without a data-collection
                // declaration. Alarms and theme live in local storage and
                // never leave the machine, so: none.
                data_collection_permissions: {
                    required: ['none']
                }
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
