import { render } from 'preact';
import Theni1App from './components/Theni1App';
import { Layout } from './layout';

function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1',
        contentHTML: '',
        timerDisplay: '00:08',
        injectNavigation: false,
    });

    const mountNode = document.getElementById('preact-root');
    if (mountNode) {
        render(<Theni1App />, mountNode);
    } else {
        console.error('Mount node #preact-root not found');
    }
}

document.addEventListener('DOMContentLoaded', init);
