import { render } from 'preact';
import { Layout } from './layout';
import Theni2App from './components/Theni2App';

// Initialize the shared Layout (for Nav, Title, and Control Panel Shell)
// We pass an empty div for contentHTML because Preact will portal into it.
export function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 2',
        contentHTML: '', // Preact Portals into #controlContent
        timerDisplay: '00:20',
        injectNavigation: true, // Layout creates .navigation buttons for us to bind to
    });

    // Render the App
    const root = document.getElementById('app-root');
    if (root) {
        render(<Theni2App />, root);
    } else {
        console.error('Root element not found');
    }
}

// Auto-run if in browser environment (not test)
if (typeof window !== 'undefined' && typeof process === 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}
