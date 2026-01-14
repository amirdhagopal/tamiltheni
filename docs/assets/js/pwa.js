/**
 * PWA Registration Module
 * Handles service worker registration and update notifications
 */
(function () {
    'use strict';

    const PWAManager = {
        registration: null,

        init: function () {
            if (!('serviceWorker' in navigator)) {
                console.log('[PWA] Service workers not supported');
                return;
            }

            this.registerServiceWorker();
            this.injectUpdateBanner();
        },

        registerServiceWorker: function () {
            const self = this;

            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('[PWA] SW registered:', registration.scope);
                    self.registration = registration;

                    // Check for updates immediately
                    registration.update();

                    // Listen for new service worker installing
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('[PWA] New service worker installing...');

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available
                                console.log('[PWA] New version available!');
                                self.showUpdateBanner();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('[PWA] SW registration failed:', error);
                });

            // Handle controller change (when skipWaiting is called)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[PWA] Controller changed, reloading...');
                window.location.reload();
            });
        },

        injectUpdateBanner: function () {
            const bannerHTML = `
                <div id="pwaUpdateBanner" class="pwa-update-banner" style="display: none;">
                    <span class="pwa-update-icon">🔄</span>
                    <span class="pwa-update-text">A new version is available!</span>
                    <button class="pwa-update-btn" onclick="PWAManager.applyUpdate()">Refresh</button>
                    <button class="pwa-update-close" onclick="PWAManager.dismissBanner()" aria-label="Dismiss">&times;</button>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', bannerHTML);
        },

        showUpdateBanner: function () {
            const banner = document.getElementById('pwaUpdateBanner');
            if (banner) {
                banner.style.display = 'flex';
                banner.classList.add('show');
            }
        },

        dismissBanner: function () {
            const banner = document.getElementById('pwaUpdateBanner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 300);
            }
        },

        applyUpdate: function () {
            if (this.registration && this.registration.waiting) {
                // Tell the waiting service worker to skip waiting
                this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
                // Fallback: just reload
                window.location.reload();
            }
        }
    };

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PWAManager.init());
    } else {
        PWAManager.init();
    }

    // Expose to window for onclick handlers
    window.PWAManager = PWAManager;
})();
