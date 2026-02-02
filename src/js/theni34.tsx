// Main entry for Theni 3 & 4 (Preact)
import { render } from 'preact';
import Theni34App from './components/Theni34App';
import { Layout } from './layout';

function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 3 & 4',
        contentHTML: '',
        timerDisplay: '00:15',
        injectNavigation: false
    });

    const mountNode = document.getElementById('preact-root');
    if (mountNode) {
        render(<Theni34App />, mountNode);
    } else {
        console.error('Mount node #preact-root not found');
    }
}

document.addEventListener('DOMContentLoaded', init);
