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
        // this.registerServiceWorker(); // Disabled: vite-plugin-pwa handles this
    },

    registerServiceWorker: function () {
        const swUrl = `${import.meta.env.BASE_URL}sw.js`;
        navigator.serviceWorker
            .register(swUrl, { scope: import.meta.env.BASE_URL })
            .then((registration) => {
                console.log('[PWA] SW registered:', registration.scope);
                this.registration = registration;

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
                                console.log('[PWA] New content is available; please refresh.');
                                this.showUpdateNotification();
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

    showUpdateNotification: function () {
        const notification = document.createElement('div');
        notification.id = 'pwa-update-notification';
        notification.className = 'pwa-update-banner'; // Ensure CSS exists for this or add inline
        notification.style.cssText =
            'position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 15px; border-radius: 8px; z-index: 9999; display: flex; gap: 10px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';

        notification.innerHTML = `
            <span>🔄 New version available!</span>
            <button id="pwa-refresh" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Refresh</button>
            <button id="pwa-dismiss" style="background: transparent; color: #aaa; border: none; cursor: pointer; font-size: 1.2em;">&times;</button>
        `;

        document.body.appendChild(notification);

        document.getElementById('pwa-refresh')?.addEventListener('click', () => {
            if (this.registration && this.registration.waiting) {
                this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
                window.location.reload();
            }
        });

        document.getElementById('pwa-dismiss')?.addEventListener('click', () => {
            notification.remove();
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
