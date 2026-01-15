const d = {
        shuffleArray: function (t) {
            for (let e = t.length - 1; e > 0; e--) {
                const i = Math.floor(Math.random() * (e + 1));
                [t[e], t[i]] = [t[i], t[e]];
            }
            return t;
        },
        updateProgress: function (t, e, i = 'progressBar', s = 'slideIndicator') {
            const a = e > 0 ? e : 1,
                n = ((t + 1) / a) * 100,
                o = document.getElementById(i);
            o && (o.style.width = `${n}%`);
            const l = document.getElementById(s);
            l && (l.innerText = `${t + 1} / ${a}`);
        },
        saveLocal: (t, e) => localStorage.setItem(t, e),
        getLocal: (t) => localStorage.getItem(t),
    },
    u = {
        duration: 15,
        timeLeft: 15,
        timerId: null,
        audioCtx: null,
        timerJustRestarted: !1,
        restartTimeoutId: null,
        isSilent: !1,
        elements: {
            btn: 'timerBtn',
            pill: 'timerPill',
            display: 'timerDisplay',
            pie: 'timerPie',
            checkbox: 'showTimer',
            label: 'timerLabel',
        },
        init: function (t = 15) {
            (this.setDuration(t), this.updateDisplay(), this.toggleVisibility());
            const e = document.getElementById(this.elements.btn);
            e &&
                (e.onclick = (s) => {
                    (this.toggle(), s.stopPropagation());
                });
            const i = document.getElementById(this.elements.checkbox);
            (i && (i.onchange = () => this.toggleVisibility()), this.setupAudioUnlock());
        },
        setDuration: function (t) {
            ((this.duration = t), this.reset());
            const e = document.getElementById(this.elements.label);
            e && e.innerText.includes('Timer') && (e.innerText = `Timer (${t}s)`);
        },
        setSilent: function (t) {
            this.isSilent = t;
        },
        toggle: function () {
            const t = document.getElementById(this.elements.btn);
            this.timerId
                ? this.pause()
                : (this.timeLeft <= 0 && this.reset(),
                  (this.timerId = setInterval(() => this.tick(), 1e3)),
                  t && (t.innerText = '⏸'));
        },
        pause: function () {
            const t = document.getElementById(this.elements.btn),
                e = document.getElementById(this.elements.pill);
            this.timerId &&
                (clearInterval(this.timerId),
                (this.timerId = null),
                t && (t.innerText = '▶'),
                e && e.classList.remove('alarm'));
        },
        reset: function () {
            (this.timerId && clearInterval(this.timerId),
                (this.timerId = null),
                (this.timeLeft = this.duration),
                this.updateDisplay());
            const t = document.getElementById(this.elements.btn);
            t &&
                ((t.innerText = '▶'),
                (t.onclick = (i) => {
                    (this.toggle(), i.stopPropagation());
                }));
            const e = document.getElementById(this.elements.pill);
            e && e.classList.remove('alarm');
        },
        restart: function () {
            this.restartTimeoutId && clearTimeout(this.restartTimeoutId);
            const t = document.getElementById(this.elements.checkbox);
            if (t && !t.checked) {
                this.reset();
                return;
            }
            ((this.timerJustRestarted = !0),
                this.reset(),
                this.toggle(),
                (this.restartTimeoutId = setTimeout(() => {
                    ((this.timerJustRestarted = !1), (this.restartTimeoutId = null));
                }, 2e3)));
        },
        tick: function () {
            this.timeLeft > 0 &&
                (this.timeLeft--,
                this.updateDisplay(),
                this.timeLeft > 0 &&
                    this.timeLeft <= 5 &&
                    !this.timerJustRestarted &&
                    !this.isSilent &&
                    this.playTickSound(),
                this.timeLeft === 0 && this.triggerAlarm());
        },
        updateDisplay: function () {
            const t = Math.floor(this.timeLeft / 60),
                e = this.timeLeft % 60,
                i = document.getElementById(this.elements.display);
            i && (i.innerText = `${t.toString().padStart(2, '0')}:${e.toString().padStart(2, '0')}`);
            const s = document.getElementById(this.elements.pie);
            if (s) {
                const a = (this.timeLeft / this.duration) * 360;
                s.style.background = `conic-gradient(#667eea ${a}deg, #f0f0f0 0)`;
            }
        },
        triggerAlarm: function () {
            (this.timerId && clearInterval(this.timerId), (this.timerId = null));
            const t = document.getElementById(this.elements.btn);
            t &&
                ((t.innerText = '↺'),
                (t.onclick = (i) => {
                    (this.reset(), i.stopPropagation());
                }));
            const e = document.getElementById(this.elements.pill);
            (e && e.classList.add('alarm'), this.isSilent || this.playAlarmSound());
        },
        toggleVisibility: function () {
            const t = document.getElementById(this.elements.checkbox),
                e = document.getElementById(this.elements.pill);
            if (!t || !e) return;
            const i = t.checked;
            ((e.style.display = i ? 'flex' : 'none'), i ? this.restart() : this.reset());
        },
        setupAudioUnlock: function () {
            const t = () => {
                if (
                    (this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()),
                    this.audioCtx)
                ) {
                    const e = this.audioCtx.resume();
                    e &&
                        e
                            .then(() => {
                                if (!this.audioCtx) return;
                                const i = this.audioCtx.createBuffer(1, 1, 22050),
                                    s = this.audioCtx.createBufferSource();
                                ((s.buffer = i), s.connect(this.audioCtx.destination), s.start(0));
                            })
                            .catch(console.warn);
                }
                (document.removeEventListener('click', t),
                    document.removeEventListener('keydown', t),
                    document.removeEventListener('touchstart', t));
            };
            (document.addEventListener('click', t),
                document.addEventListener('keydown', t),
                document.addEventListener('touchstart', t));
        },
        playTickSound: function () {
            if (
                (this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()),
                this.audioCtx && this.audioCtx.state === 'suspended' && this.audioCtx.resume(),
                !this.audioCtx)
            )
                return;
            const t = this.audioCtx.sampleRate * 0.03,
                e = this.audioCtx.createBuffer(1, t, this.audioCtx.sampleRate),
                i = e.getChannelData(0);
            for (let o = 0; o < t; o++) i[o] = (Math.random() * 2 - 1) * Math.exp(-o / (t * 0.1));
            const s = this.audioCtx.createBufferSource();
            s.buffer = e;
            const a = this.audioCtx.createBiquadFilter();
            ((a.type = 'bandpass'), (a.frequency.value = 3e3), (a.Q.value = 2));
            const n = this.audioCtx.createGain();
            (n.gain.setValueAtTime(0.4, this.audioCtx.currentTime),
                n.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03),
                s.connect(a),
                a.connect(n),
                n.connect(this.audioCtx.destination),
                s.start());
        },
        playAlarmSound: function () {
            if (
                (this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()),
                this.audioCtx && this.audioCtx.state === 'suspended' && this.audioCtx.resume(),
                !this.audioCtx)
            )
                return;
            const t = [523.25, 659.25, 783.99],
                e = 0.15,
                i = 0.6;
            t.forEach((s, a) => {
                if (!this.audioCtx) return;
                const n = this.audioCtx.currentTime + a * e,
                    o = this.audioCtx.createOscillator(),
                    l = this.audioCtx.createGain();
                ((o.type = 'sine'),
                    o.frequency.setValueAtTime(s, n),
                    l.gain.setValueAtTime(0, n),
                    l.gain.linearRampToValueAtTime(0.15, n + 0.05),
                    l.gain.exponentialRampToValueAtTime(0.01, n + i),
                    o.connect(l),
                    l.connect(this.audioCtx.destination),
                    o.start(n),
                    o.stop(n + i));
                const c = this.audioCtx.createOscillator(),
                    r = this.audioCtx.createGain();
                ((c.type = 'sine'),
                    c.frequency.setValueAtTime(s * 2, n),
                    r.gain.setValueAtTime(0, n),
                    r.gain.linearRampToValueAtTime(0.03, n + 0.05),
                    r.gain.exponentialRampToValueAtTime(0.001, n + i),
                    c.connect(r),
                    r.connect(this.audioCtx.destination),
                    c.start(n),
                    c.stop(n + i));
            });
        },
    },
    m = {
        init: function (t) {
            (this.injectControlPanel(t.title, t.contentHTML),
                this.injectCircularTimer(t.timerDisplay),
                t.injectNavigation && this.injectNavigation());
        },
        injectControlPanel: function (t, e) {
            const i = `
            <div class="control-panel" id="controlPanel">
                <div class="control-header" onclick="document.getElementById('controlPanel').classList.toggle('collapsed')">
                    <h3><span>⚙️</span> ${t}</h3>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="control-content">
                    ${e}
                    <div class="control-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                        <a href="../index.html" class="action-button" style="text-decoration: none; background: rgba(255,255,255,0.1); width: 100%; justify-content: center;">
                            <span>🏠</span> Back to Portal Home
                        </a>
                    </div>
                </div>
            </div>
        `;
            document.body.insertAdjacentHTML('afterbegin', i);
        },
        injectCircularTimer: function (t = '00:15') {
            const e = `
            <div class="circular-timer" id="timerPill" title="Study Timer">
                <div class="timer-visual" id="timerPie"></div>
                <div class="timer-content">
                    <span class="timer-display" id="timerDisplay">${t}</span>
                    <button class="timer-btn" id="timerBtn" title="Play/Pause">▶</button>
                </div>
            </div>
        `;
            document.body.insertAdjacentHTML('beforeend', e);
        },
        injectNavigation: function () {
            const t = `
            <div class="navigation">
                <button class="nav-btn" id="firstBtn" title="First Slide (Home)">⏮</button>
                <button class="nav-btn" id="prevBtn" title="Previous Slide (←)">◀</button>
                <span style="align-self: center; color: #757575; font-weight: 600; min-width: 80px; text-align: center;" id="counter"></span>
                <button class="nav-btn" id="nextBtn" title="Next / Reveal (→, Space)">▶</button>
                <button class="nav-btn" id="lastBtn" title="Last Slide (End)">⏭</button>
            </div>
        `,
                e = document.querySelector('.slide-container');
            e && e.insertAdjacentHTML('beforeend', t);
        },
    },
    h = {
        timerDurations: { theni1: 8, theni2: 20, theni3: 15, theni4: 40, theni5: 60 },
        gemini: {
            defaultModel: 'models/gemini-1.5-flash',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        },
    };
export { m as L, u as T, d as U, h as c };
