/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    // When running from root with --config, root defaults to CWD (root).
    base: command === 'build' ? '/tamiltheni/' : '/',
    build: {
        outDir: 'docs',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: 'index.html',
                theni1: 'html/theni1.html',
                theni2: 'html/theni2.html',
                theni34: 'html/theni34.html',
                theni5: 'html/theni5.html',
            },
        },
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
            manifest: {
                name: 'TamilTheni - தமிழ்த்தேனி',
                short_name: 'TamilTheni',
                description: 'Tamil language learning app for the FETNA Tamil Theni competition',
                theme_color: '#667eea',
                icons: [
                    {
                        src: 'assets/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'assets/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'assets/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                // We will refine this later if needed, but for now standard caching is fine
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/tamiltheni/images/'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                            },
                        },
                    },
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        exclude: ['node_modules', 'dist', 'test/e2e/**']
    }
}));
