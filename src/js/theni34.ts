// Main entry for Theni 3 & 4 (Preact)
import { h, render } from 'preact';
import Theni34App from './components/Theni34App';
import { Layout } from './layout';

function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 3 & 4',
        contentHTML: '',
        timerDisplay: '00:15',
        injectNavigation: true
    });

    const root = document.getElementById('app') || document.body;
    let mountNode = document.getElementById('preact-root');
    if (!mountNode) {
        mountNode = document.createElement('div');
        mountNode.id = 'preact-root';
        root.appendChild(mountNode);
    }

    render(<Theni34App />, mountNode);
}

document.addEventListener('DOMContentLoaded', init);
