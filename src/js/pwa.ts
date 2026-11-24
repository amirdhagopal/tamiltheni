/**
 * PWA Registration Module
 * Handles service worker registration and update notifications
 */
const PWAManager = {
    registration: null as ServiceWorkerRegistration | null,

    init: function () {
        if (!('serviceWorker' in navigator)) {
            console.log('[PWA] Service workers not supported');
            return;
        }
        this.registerServiceWorker();
    },

    registerServiceWorker: function () {
        // Skip service worker registration when running under the Vite dev server
        if (document.querySelector('script[src*="/@vite/client"]')) {
            return;
        }

        // In production, it's 'sw.js'
        const isHtmlSubdir = window.location.pathname.includes('/html/');
        const pathPrefix = isHtmlSubdir ? '../' : './';

        const swUrl = `${pathPrefix}sw.js`;

        navigator.serviceWorker
            .register(swUrl, { scope: pathPrefix })
            .then((registration) => {
                console.log('[PWA] SW registered:', registration.scope);
                this.registration = registration;
                registration.update();

                // Check for updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker == null) {
                        return;
                    }
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New update available
                                // Force update immediately
                                console.log('[PWA] New content available. Forcing update...');
                                installingWorker.postMessage({ type: 'SKIP_WAITING' });
                            } else {
                                console.log('[PWA] Content is cached for offline use.');
                            }
                        }
                    };
                };
            })
            .catch((error) => {
                console.error('[PWA] SW registration failed:', error);
            });

        // Controller change reload
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    },
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWAManager.init());
} else {
    PWAManager.init();
}

export default PWAManager;
