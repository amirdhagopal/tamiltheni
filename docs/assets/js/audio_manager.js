/**
 * Shared Audio Manager for TamilTheni
 * Handles Text-to-Speech (TTS) abstracting browser differences.
 */
const TheniAudio = {
    synth: window.speechSynthesis,
    isMuted: false,

    init: function () {
        // Some browsers need an initial interaction to enable speech
        // We can hook into the existing unlockAudio in timer.js or do it here
        // Since timer.js handles AudioContext (Web Audio API), this handles SpeechSynthesis

        // Ensure voices are loaded (Chrome assumes async)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.getVoice('ta-IN');
            };
        }
    },

    speak: function (text, lang = 'ta-IN') {
        if (this.isMuted) return;
        if (this.synth.speaking) this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;

        // Try to pick a specific voice if available
        const voice = this.getVoice(lang);
        if (voice) utterance.voice = voice;

        this.synth.speak(utterance);
    },

    getVoice: function (lang) {
        const voices = this.synth.getVoices();
        // Prefer Google Tamil, then any Tamil, then fallback
        return voices.find(v => v.lang === lang && v.name.includes('Google')) ||
            voices.find(v => v.lang === lang);
    },

    toggleMute: function () {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    },

    setMuted: function (muted) {
        this.isMuted = muted;
    }
};

// Auto-init
if (window.speechSynthesis) {
    TheniAudio.init();
}

window.TheniAudio = TheniAudio;
