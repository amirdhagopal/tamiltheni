if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/tamiltheni/sw.js', { scope: '/tamiltheni/' });
    });
}
