/**
 * Shared Timer Module for TamilTheni
 * Handles visual timer (pie chart), countdown, and audio ticks/alarms.
 */

// Define interface for timer elements config
interface TimerElements {
    btn: string;
    pill: string;
    display: string;
    pie: string;
    checkbox: string;
    label: string;
}

export const Timer = {
    duration: 15, // default
    timeLeft: 15,
    timerId: null as ReturnType<typeof setTimeout> | null,
    audioCtx: null as AudioContext | null,
    timerJustRestarted: false,
    restartTimeoutId: null as ReturnType<typeof setTimeout> | null,
    isSilent: false, // New property to mute audio

    // Configuration
    elements: {
        btn: 'timerBtn',
        pill: 'timerPill',
        display: 'timerDisplay',
        pie: 'timerPie',
        checkbox: 'showTimer',
        label: 'timerLabel' // Optional label to update text
    } as TimerElements,

    init: function (duration = 15): void {
        this.setDuration(duration);

        // Initial UI setup
        this.updateDisplay();
        this.toggleVisibility(); // Check initial checkbox state

        // Attach event listeners if elements exist
        const btn = document.getElementById(this.elements.btn);
        if (btn) {
            btn.onclick = (e) => {
                this.toggle();
                e.stopPropagation();
            };
        }

        const checkbox = document.getElementById(this.elements.checkbox) as HTMLInputElement;
        if (checkbox) {
            checkbox.onchange = () => this.toggleVisibility();
        }

        // Global unlock for audio on interaction
        this.setupAudioUnlock();
    },

    setDuration: function (seconds: number): void {
        this.duration = seconds;
        this.reset(); // Resetting updates timeLeft to new duration

        // Update label if exists (e.g. "Timer (8s)")
        const label = document.getElementById(this.elements.label);
        if (label && label.innerText.includes('Timer')) {
            label.innerText = `Timer (${seconds}s)`;
        }
    },

    setSilent: function (silent: boolean): void {
        this.isSilent = silent;
    },

    toggle: function (): void {
        const btn = document.getElementById(this.elements.btn);

        if (this.timerId) {
            this.pause();
        } else {
            // Start
            if (this.timeLeft <= 0) this.reset();
            this.timerId = setInterval(() => this.tick(), 1000);
            if (btn) btn.innerText = '⏸';
        }
    },

    pause: function (): void {
        const btn = document.getElementById(this.elements.btn);
        const pill = document.getElementById(this.elements.pill);
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
            if (btn) btn.innerText = '▶';
            if (pill) pill.classList.remove('alarm');
        }
    },

    reset: function (): void {
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = null;
        this.timeLeft = this.duration;
        this.updateDisplay();

        const btn = document.getElementById(this.elements.btn);
        if (btn) {
            btn.innerText = '▶';
            // Re-bind click to toggle (in case it was set to reset during alarm)
            btn.onclick = (e) => {
                this.toggle();
                e.stopPropagation();
            };
        }

        const pill = document.getElementById(this.elements.pill);
        if (pill) pill.classList.remove('alarm');
    },

    restart: function (): void {
        if (this.restartTimeoutId) {
            clearTimeout(this.restartTimeoutId);
        }

        // Only restart if visible/enabled
        const checkbox = document.getElementById(this.elements.checkbox) as HTMLInputElement;
        if (checkbox && !checkbox.checked) {
            this.reset();
            return;
        }

        this.timerJustRestarted = true;
        this.reset();
        this.toggle(); // Start immediately

        this.restartTimeoutId = setTimeout(() => {
            this.timerJustRestarted = false;
            this.restartTimeoutId = null;
        }, 2000);
    },

    tick: function (): void {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();

            // Play tick sound for last 5 seconds (if not silent)
            if (this.timeLeft > 0 && this.timeLeft <= 5 && !this.timerJustRestarted && !this.isSilent) {
                this.playTickSound();
            }

            if (this.timeLeft === 0) {
                this.triggerAlarm();
            }
        }
    },

    updateDisplay: function (): void {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const display = document.getElementById(this.elements.display);
        if (display) {
            display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        const pie = document.getElementById(this.elements.pie);
        if (pie) {
            const angle = (this.timeLeft / this.duration) * 360;
            pie.style.background = `conic-gradient(#667eea ${angle}deg, #f0f0f0 0)`;
        }
    },

    triggerAlarm: function (): void {
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = null;

        const btn = document.getElementById(this.elements.btn);
        if (btn) {
            btn.innerText = '↺';
            btn.onclick = (e) => {
                this.reset();
                e.stopPropagation();
            };
        }

        const pill = document.getElementById(this.elements.pill);
        if (pill) pill.classList.add('alarm');

        if (!this.isSilent) {
            this.playAlarmSound();
        }
    },

    toggleVisibility: function (): void {
        const checkbox = document.getElementById(this.elements.checkbox) as HTMLInputElement;
        const pill = document.getElementById(this.elements.pill);

        if (!checkbox || !pill) return;

        const isVisible = checkbox.checked;
        pill.style.display = isVisible ? 'flex' : 'none';

        if (isVisible) {
            this.restart();
        } else {
            this.reset();
        }
    },

    // --- Audio Functions ---

    setupAudioUnlock: function (): void {
        const unlock = () => {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx) {
                const resumePromise = this.audioCtx.resume();
                if (resumePromise) {
                    resumePromise.then(() => {
                        // Silent buffer to fully unlock
                        if (!this.audioCtx) return;
                        const silentBuffer = this.audioCtx.createBuffer(1, 1, 22050);
                        const source = this.audioCtx.createBufferSource();
                        source.buffer = silentBuffer;
                        source.connect(this.audioCtx.destination);
                        source.start(0);
                    }).catch(console.warn);
                }
            }
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock);
        };

        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        document.addEventListener('touchstart', unlock);
    },

    playTickSound: function (): void {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();

        if (!this.audioCtx) return;

        const bufferSize = this.audioCtx.sampleRate * 0.03;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 2;

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        noise.start();
    },

    playAlarmSound: function (): void {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();

        if (!this.audioCtx) return;

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        const noteDelay = 0.15;
        const noteDuration = 0.6;

        notes.forEach((freq, i) => {
            if (!this.audioCtx) return;
            const startTime = this.audioCtx.currentTime + (i * noteDelay);
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + noteDuration);

            // Harmonic
            const osc2 = this.audioCtx.createOscillator();
            const gain2 = this.audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2, startTime);
            gain2.gain.setValueAtTime(0, startTime);
            gain2.gain.linearRampToValueAtTime(0.03, startTime + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
            osc2.connect(gain2);
            gain2.connect(this.audioCtx.destination);
            osc2.start(startTime);
            osc2.stop(startTime + noteDuration);
        });
    }
};
