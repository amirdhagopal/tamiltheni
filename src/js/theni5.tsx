// Main entry for Theni 5 (Preact)
import { render } from 'preact';
import Theni5App from './components/Theni5App';
import { Layout } from './layout';

function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 5',
        contentHTML: '',
        timerDisplay: '01:00',
        injectNavigation: false
    });

    const mountNode = document.getElementById('preact-root');
    if (mountNode) {
        render(<Theni5App />, mountNode);
    } else {
        console.error('Mount node #preact-root not found');
    }
}

document.addEventListener('DOMContentLoaded', init);
