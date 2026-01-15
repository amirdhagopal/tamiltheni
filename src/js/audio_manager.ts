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
        this.setupAudioUnlock();
    },

    setupAudioUnlock: function (): void {
        const unlock = () => {
            // Unlock TTS
            if (this.synth.paused) this.synth.resume();
            // Play silent utterance to unlock iOS/Chrome strict policies
            const u = new SpeechSynthesisUtterance('');
            u.volume = 0; // Silent
            this.synth.speak(u);

            document.removeEventListener('click', unlock, { capture: true });
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock, { capture: true });
            console.log('[AudioManager] Audio unlock triggered.');
        };

        document.addEventListener('click', unlock, { capture: true });
        document.addEventListener('keydown', unlock);
        document.addEventListener('touchstart', unlock, { capture: true });
    },

    speak: function (text: string, lang = 'ta-IN'): void {
        console.log(`[AudioManager] Request to speak: "${text}" in ${lang}`);
        if (this.isMuted) {
            console.log('[AudioManager] Speaker is muted.');
            return;
        }
        if (this.synth.speaking) this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;

        // Try to pick a specific voice if available
        const voice = this.getVoice(lang);
        if (voice) {
            utterance.voice = voice;
            console.log(`[AudioManager] Using voice: ${voice.name}`);
        } else {
            console.warn(`[AudioManager] No specific voice found for ${lang}, using browser default.`);
        }

        utterance.onerror = (e) => console.error('[AudioManager] Utterance error:', e);

        this.synth.speak(utterance);
    },

    getVoice: function (lang: string): SpeechSynthesisVoice | undefined {
        const voices = this.synth.getVoices();
        // 1. Exact match with Google
        let voice = voices.find((v) => v.lang === lang && v.name.includes('Google'));
        // 2. Exact match any
        if (!voice) voice = voices.find((v) => v.lang === lang);
        // 3. Base language match (e.g. 'en' for 'en-US')
        if (!voice && lang.includes('-')) {
            const baseLang = lang.split('-')[0];
            voice = voices.find((v) => v.lang.startsWith(baseLang));
        }
        return voice;
    },

    toggleMute: function (): boolean {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    },

    setMuted: function (muted: boolean): void {
        this.isMuted = muted;
    },
};

// Auto-init
if (window.speechSynthesis) {
    AudioManager.init();
}
