/**
 * Shared Audio Manager for TamilTheni
 * Handles Text-to-Speech (TTS) abstracting browser differences.
 */
export const AudioManager = {
    synth: window.speechSynthesis,
    isMuted: false,

    init: function (): void {
        // Ensure voices are loaded (Chrome assumes async)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.getVoice('ta-IN');
            };
        }
    },

    speak: function (text: string, lang = 'ta-IN'): void {
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

    getVoice: function (lang: string): SpeechSynthesisVoice | undefined {
        const voices = this.synth.getVoices();
        // Prefer Google Tamil, then any Tamil, then fallback
        return voices.find(v => v.lang === lang && v.name.includes('Google')) ||
            voices.find(v => v.lang === lang);
    },

    toggleMute: function (): boolean {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    },

    setMuted: function (muted: boolean): void {
        this.isMuted = muted;
    }
};

// Auto-init
if (window.speechSynthesis) {
    AudioManager.init();
}
