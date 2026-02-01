// Main entry for Theni 5 (Preact)
import { h, render } from 'preact';
import Theni5App from './components/Theni5App';
import { Layout } from './layout';

function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 5',
        contentHTML: '',
        timerDisplay: '00:00',
        injectNavigation: false // Grid view usually doesn't need Next/Prev buttons
    });

    const root = document.getElementById('app') || document.body;
    let mountNode = document.getElementById('preact-root');
    if (!mountNode) {
        mountNode = document.createElement('div');
        mountNode.id = 'preact-root';
        root.appendChild(mountNode);
    }

    render(<Theni5App />, mountNode);
}

document.addEventListener('DOMContentLoaded', init);
