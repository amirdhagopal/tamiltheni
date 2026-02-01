// Main entry for Theni 1 (Preact)
import { h, render } from 'preact';
import Theni1App from './components/Theni1App';
import { Layout } from './layout';

function init() {
    // 1. Init Layout Structure (Header, Nav, etc.)
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1',
        contentHTML: '', // Controls injected via Portal
        timerDisplay: '00:08',
        injectNavigation: true, // We still use Layout's nav buttons
    });

    // 2. Mount Preact App
    // We need a root for the app content. Layout header handles global stuff.
    // Layout.init injects #controlPanel. We can mount our app adjacent or inside a main container.
    // Typically our "App" renders the Card into the main view and Portals the controls.

    // Check if a root exists or use body/specific container
    // Currently Layout expects us to populate #slides-wrapper potentially, but Preact is taking over.
    // Let's create a root div if not present or hook into an existing one.
    // Layout.ts structure creates a structure. We should probably clear body or target the "main" area.

    // In Layout.ts:
    // It creates `controls-panel` and potentially expects content.
    // But for the main "Slide" area, Layout DOES NOT create a specific container in its `init` logic shown earlier?
    // Wait, let me check Layout.ts again.

    // Checking Layout.ts in mind:
    // It injects Header and Control Panel.
    // It DOES NOT touch the main #app or body content other than appending.

    // So for Theni 1, we expect a <div id="app"> or similar in the HTML.
    // let's look at `theni1.html`.

    const root = document.getElementById('app') || document.body;
    // We want to replace the "slide-wrapper" logic with our App.
    // Let's create a dedicated root for Preact if "app" isn't exclusive.

    let mountNode = document.getElementById('preact-root');
    if (!mountNode) {
        mountNode = document.createElement('div');
        mountNode.id = 'preact-root';
        root.appendChild(mountNode);
    }

    render(<Theni1App />, mountNode);
}

document.addEventListener('DOMContentLoaded', init);
