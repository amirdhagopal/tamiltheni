/**
 * Shared Configuration for TamilTheni
 */
const TheniConfig = {
    timerDurations: {
        theni1: 8,
        theni2: 20,
        theni3: 15,
        theni4: 40,
        theni5: 60
    },
    gemini: {
        defaultModel: 'models/gemini-1.5-flash',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
    }
};

window.TheniConfig = TheniConfig;
