/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command, isPreview }) => ({
    // When running from root with --config, root defaults to CWD (root).
    // Use relative paths to support both local preview at root and production deployment
    base: './',
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
            injectRegister: null, // Manual registration to handle relative paths correctly
            manifestFilename: 'manifest.webmanifest',
            // We specify the manifest content but disable injecting the link tag to HTML
            // because vite-plugin-pwa doesn't handle subdirectories correctly with relative base
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
                        src: 'assets/icons/icon-maskable-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },
            injectManifest: {
                injectionPoint: undefined // Disable injection
            },
            workbox: {
                // Cache all static assets including images
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                // Exclude icons folder to prevent duplicate cache entries (icons are in manifest)
                globIgnores: ['**/assets/icons/**'],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.includes('/images/'),
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
