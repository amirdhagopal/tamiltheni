import './pwa-DOeEgxuH.js';
import { L as N, T as k, c as _, U as V } from './config-U83h9fBs.js';
import { A as p } from './audio_manager-C32Gx6Zs.js';
import { t as z } from './theni_words-xXaqkVpm.js';
let c = 0,
    w = !0,
    C = !1,
    m = null,
    h = 'all',
    r = [],
    y = [],
    v = [],
    l = [],
    L = !1;
const A = window.SpeechRecognition || window.webkitSpeechRecognition;
let a = null,
    b = !1;
A
    ? ((a = new A()),
      (a.lang = 'ta-IN'),
      (a.interimResults = !1),
      (a.maxAlternatives = 1),
      (a.onresult = (e) => {
          const t = e.results[0][0].transcript.trim();
          G(t);
      }),
      (a.onerror = (e) => {
          (e.error !== 'no-speech' &&
              (console.error('Speech recognition error:', e.error), x('Error: ' + e.error, 'error')),
              f());
      }),
      (a.onend = () => {
          b && f();
      }))
    : console.warn('Speech recognition not supported.');
function H() {
    const e = document.getElementById('slides-wrapper');
    if (!e) {
        console.error('Missing slides-wrapper');
        return;
    }
    ((e.innerHTML = ''),
        z.forEach((t, o) => {
            const n = document.createElement('div');
            ((n.className = o === 0 ? 'slide active' : 'slide'),
                (n.id = `slide-${o}`),
                (n.style.display = o === 0 ? 'flex' : 'none'),
                (n.innerHTML = `
            <div class="image-container">
                <img src="https://placehold.co/400x300?text=Loading..."
                     data-word="${t.image_word}"
                     alt="${t.word_en}"
                     class="slide-image">
            </div>
            <div class="word-row">
                <div class="word-en">${t.word_en}</div>
                <button class="mic-button-inline" id="mic-btn-${o}" title="Voice Validation">🎤</button>
                <span class="voice-feedback-inline"></span>
            </div>
            <div class="word-ta">${t.word_ta}</div>
            <div class="card-footer">
                <div class="footer-left">
                    <span class="category-badge">${t.category}</span>
                    <span class="category-badge-ta">${t.category_ta}</span>
                    <span class="difficulty-badge">${t.difficulty}</span>
                </div>
            </div>
        `),
                e.appendChild(n));
            const i = n.querySelector(`#mic-btn-${o}`);
            i &&
                i.addEventListener('click', (s) => {
                    (s.stopPropagation(), W());
                });
        }),
        (v = Array.from(document.querySelectorAll('.slide'))),
        (l = [...v]));
}
function U(e) {
    (e.stopPropagation(), document.getElementById('categoryMenu')?.classList.toggle('show'));
}
function O() {
    const e = new Map();
    (v.forEach((o) => {
        const n = o.querySelector('.category-badge')?.textContent,
            i = o.querySelector('.category-badge-ta')?.textContent,
            s = `${n} - ${i} `;
        e.has(s) || e.set(s, !0);
    }),
        (y = Array.from(e.keys())),
        (r = [...y]));
    const t = document.getElementById('categoryList');
    t &&
        ((t.innerHTML = ''),
        y.forEach((o) => {
            const n = document.createElement('div');
            n.className = 'dropdown-item';
            const i = document.createElement('input');
            ((i.type = 'checkbox'), (i.checked = !0), (i.id = `cat - ${o} `));
            const s = document.createElement('span');
            ((s.innerText = o),
                n.appendChild(i),
                n.appendChild(s),
                n.addEventListener('click', (d) => {
                    (d.stopPropagation(), T(o));
                }),
                i.addEventListener('click', (d) => {
                    (d.stopPropagation(), T(o));
                }),
                t.appendChild(n));
        }),
        S());
}
function T(e) {
    const t = r.indexOf(e);
    t > -1 ? r.splice(t, 1) : r.push(e);
    const o = document.getElementById(`cat - ${e} `);
    (o && (o.checked = r.includes(e)), S(), E());
}
function j(e) {
    const t = document.getElementById('selectAllCats');
    e.target !== t && (t.checked = !t.checked);
    const o = t.checked;
    (o ? (r = [...y]) : (r = []),
        document.querySelectorAll('#categoryList input').forEach((n) => {
            n.checked = o;
        }),
        S(),
        E());
}
function S() {
    const e = document.getElementById('selectedCatText'),
        t = document.getElementById('selectAllCats');
    !e ||
        !t ||
        (r.length === y.length
            ? ((e.textContent = 'All Categories'), (t.checked = !0))
            : r.length === 0
              ? ((e.textContent = 'None selected'), (t.checked = !1))
              : ((e.textContent = `${r.length} selected`), (t.checked = !1)));
}
function E(e = !0) {
    ((l = v.filter((t) => {
        const o = t.querySelector('.difficulty-badge')?.textContent,
            n = t.querySelector('.category-badge')?.textContent,
            i = t.querySelector('.category-badge-ta')?.textContent,
            s = `${n} - ${i} `,
            d = h === 'all' || o === h,
            F = r.includes(s);
        return d && F;
    })),
        L && V.shuffleArray(l),
        e && (c = 0),
        $(),
        u());
}
function g(e) {
    ((h = e),
        document.querySelectorAll('.pill-button').forEach((t) => t.classList.remove('active')),
        document.getElementById(`filter${e === 'all' ? 'All' : e} `)?.classList.add('active'),
        E());
}
function q() {
    ((L = !0), E());
}
function D() {
    ((L = !1), E());
}
function $() {
    const e = l.filter((s) => s.querySelector('.difficulty-badge')?.textContent === 'D1').length,
        t = l.filter((s) => s.querySelector('.difficulty-badge')?.textContent === 'D2').length,
        o = h === 'all' ? 'All Difficulty' : h,
        n = L ? ' (Shuffled)' : '',
        i = document.getElementById('progressInfo');
    i &&
        (i.textContent = `${l.length === 0 ? 0 : c + 1}/${l.length} slides - Filter: ${o}${n} (Matches: D1=${e}, D2=${t})`);
}
function K(e, t) {
    if (!e) return;
    const n = `assets/images/theni12/${e
            .replace(/[^a-zA-Z0-9 \-_]/g, '')
            .trim()
            .replace(/\s+/g, '_')}.jpg`,
        i = '/tamiltheni/' + n.replace(/^assets\//, 'assets/');
    ((t.onerror = function () {
        if (((t.onerror = null), t.src.includes(i))) {
            (console.warn(`[ImageLoad] Failed absolute path: ${i}. Retrying with relative...`), (t.src = `../${n}`));
            return;
        }
        (console.warn(`Missing local image for: ${e} (${i})`),
            (t.src = `https://placehold.co/400x300?text=${encodeURIComponent(e)}`));
    }),
        (t.src = i));
}
function W() {
    if (!a) {
        alert('Speech recognition is not supported in this browser.');
        return;
    }
    b ? f() : Z();
}
function Z() {
    if (a)
        try {
            (a.start(), (b = !0));
            const t = l[c]?.querySelector('.mic-button-inline');
            (t &&
                (t.classList.add('recording'),
                t.setAttribute('title', 'Voice Validation is ACTIVE - Click to Stop Listening')),
                x('Listening for Tamil...', 'success'));
        } catch (e) {
            console.error('Recognition start error:', e);
        }
}
function f() {
    (a && b && a.stop(),
        (b = !1),
        document.querySelectorAll('.mic-button-inline.recording').forEach((e) => {
            (e.classList.remove('recording'), e.setAttribute('title', 'Voice Validation - Click to Start Listening'));
        }));
}
function G(e) {
    const t = l[c];
    if (!t) return;
    const o = t.querySelector('.word-ta')?.textContent?.trim() || '',
        n = (d) =>
            d
                .toLowerCase()
                .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
                .replace(/\s+/g, ''),
        i = n(e),
        s = n(o);
    (i === s || s.includes(i) || i.includes(s)
        ? (x(`Correct! ✅ (${e})`, 'success'), t.classList.add('revealed'))
        : x(`Heard "${e}" ❌`, 'error'),
        f());
}
function x(e, t) {
    const n = l[c]?.querySelector('.voice-feedback-inline');
    n &&
        ((n.textContent = e),
        (n.className = `voice-feedback-inline ${t}`),
        t !== 'recording' &&
            !e.includes('Listening') &&
            setTimeout(() => {
                n.textContent === e && ((n.className = 'voice-feedback-inline'), (n.textContent = ''));
            }, 4e3));
}
function J() {
    if (((w = document.getElementById('audioToggle').checked), w)) {
        const t = l[c];
        if (t) {
            const o = t.querySelector('.word-en');
            o && o.textContent && p.speak(o.textContent, 'en-US');
        }
    } else (m && clearTimeout(m), p.synth && p.synth.speaking && p.synth.cancel());
}
function Q() {
    ((C = document.getElementById('voiceToggle').checked),
        document.querySelectorAll('.mic-button-inline').forEach((t) => {
            t.style.display = C ? 'flex' : 'none';
        }),
        C ||
            (document.querySelectorAll('.voice-feedback-inline').forEach((t) => {
                ((t.textContent = ''), (t.className = 'voice-feedback-inline'));
            }),
            f()));
}
function u(e = !0) {
    (v.forEach((t) => {
        (t.classList.remove('active'), (t.style.display = 'none'), (t.style.visibility = 'hidden'));
    }),
        l.forEach((t, o) => {
            if (
                ((t.style.display = o === c ? 'flex' : 'none'),
                (t.style.visibility = o === c ? 'visible' : 'hidden'),
                o === c)
            ) {
                t.classList.add('active');
                const n = t.querySelector('.slide-image');
                n && n.dataset.word && !n.dataset.loaded && (K(n.dataset.word, n), (n.dataset.loaded = 'true'));
                const i = t.querySelector('.word-en');
                (i &&
                    i.textContent &&
                    (m && clearTimeout(m),
                    w &&
                        e &&
                        (m = setTimeout(() => {
                            w && i.textContent && p.speak(i.textContent, 'en-US');
                        }, 300))),
                    f());
            } else t.classList.remove('revealed');
        }),
        (document.getElementById('firstBtn').disabled = c === 0),
        (document.getElementById('prevBtn').disabled = c === 0),
        (document.getElementById('nextBtn').disabled = c === l.length - 1),
        (document.getElementById('lastBtn').disabled = c === l.length - 1),
        V.updateProgress(c, l.length, 'progressBar', 'counter'),
        $(),
        document.getElementById('showTimer').checked && k.restart());
}
function M() {
    l.length > 0 && ((c = 0), u());
}
function R() {
    l.length > 0 && ((c = l.length - 1), u());
}
function I(e) {
    const t = c + e;
    t >= 0 && t < l.length && ((c = t), u());
}
function B() {
    l[c] && (l[c].classList.contains('revealed') ? I(1) : l[c].classList.add('revealed'));
}
function P() {
    const e = window.location.hash.substring(1),
        t = `slide-${parseInt(e) - 1}`,
        o = l.findIndex((n) => n.id === t);
    o !== -1 ? ((c = o), u()) : l.length > 0 && (c >= l.length && (c = 0), u());
}
function X() {
    (N.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1',
        contentHTML: `
            <div class="control-row">
                <span class="control-label">Categories:</span>
                <div class="category-dropdown">
                    <button class="dropdown-button" id="cat-dropdown-btn">
                        <span id="selectedCatText">All Categories</span>
                        <span>▼</span>
                    </button>
                    <div class="dropdown-menu" id="categoryMenu">
                        <div class="dropdown-item header" id="select-all-cat-row">
                            <input type="checkbox" id="selectAllCats" checked>
                            <span>Select All / None</span>
                        </div>
                        <div id="categoryList"></div>
                    </div>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Difficulty:</span>
                <div class="pill-group">
                    <button class="pill-button active" id="filterAll">All</button>
                    <button class="pill-button" id="filterD1">D1 Only</button>
                    <button class="pill-button" id="filterD2">D2 Only</button>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Sequence:</span>
                <div class="pill-group">
                    <button class="action-button" id="btn-shuffle"><span>🔀</span> Shuffle</button>
                    <button class="action-button" id="btn-reset-seq"><span>↩️</span> Reset</button>
                </div>
                <div style="margin-left: auto; display: flex; gap: 15px;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="showTimer" checked> ⏱️ Timer (8s)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="audioToggle" checked> 🔊 Audio
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="voiceToggle"> 🎤 Voice
                    </label>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Progress:</span>
                <span class="progress-info" id="progressInfo">Loading...</span>
            </div>
        `,
        timerDisplay: '00:08',
        injectNavigation: !0,
    }),
        document.getElementById('cat-dropdown-btn')?.addEventListener('click', U),
        document.getElementById('select-all-cat-row')?.addEventListener('click', j),
        document.getElementById('filterAll')?.addEventListener('click', () => g('all')),
        document.getElementById('filterD1')?.addEventListener('click', () => g('D1')),
        document.getElementById('filterD2')?.addEventListener('click', () => g('D2')),
        document.getElementById('btn-shuffle')?.addEventListener('click', q),
        document.getElementById('btn-reset-seq')?.addEventListener('click', D),
        document.getElementById('showTimer')?.addEventListener('change', k.toggleVisibility.bind(k)),
        document.getElementById('audioToggle')?.addEventListener('change', J),
        document.getElementById('voiceToggle')?.addEventListener('change', Q),
        document.getElementById('firstBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), M());
        }),
        document.getElementById('prevBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), I(-1));
        }),
        document.getElementById('nextBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), B());
        }),
        document.getElementById('lastBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), R());
        }),
        document.getElementById('slides-wrapper')?.addEventListener('click', (e) => {
            e.target.closest('button, input, .control-panel') || B();
        }),
        document.addEventListener('click', (e) => {
            if (
                (e.target.closest('.category-dropdown') ||
                    document.getElementById('categoryMenu')?.classList.remove('show'),
                !e.target.closest('.control-panel'))
            ) {
                const t = document.getElementById('controlPanel');
                t && !t.classList.contains('collapsed') && t.classList.add('collapsed');
            }
        }),
        document.addEventListener('keydown', (e) => {
            (e.key === 'ArrowLeft' && I(-1),
                (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') && B(),
                e.key === 'Home' && M(),
                e.key === 'End' && R(),
                e.key === '1' && g('D1'),
                e.key === '2' && g('D2'),
                (e.key === 'a' || e.key === 'A') && g('all'),
                (e.key === 's' || e.key === 'S') && q(),
                (e.key === 'r' || e.key === 'R') && D());
        }),
        window.addEventListener('hashchange', P),
        H(),
        O(),
        k.init(_.timerDurations.theni1),
        $(),
        window.location.hash ? P() : u(!0));
}
document.addEventListener('DOMContentLoaded', X);
