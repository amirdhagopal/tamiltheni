import './pwa-DOeEgxuH.js';
import { L as J, T as w, c as A, U as O } from './config-U83h9fBs.js';
import { A as f } from './audio_manager-C32Gx6Zs.js';
import { t as W } from './theni_words-xXaqkVpm.js';
let l = 0,
    x = !0,
    B = 'all',
    g = [],
    v = [],
    k = [],
    a = [],
    L = !1,
    b = {};
const S = {},
    M = {};
async function V() {
    (Z(),
        X(),
        q(),
        w.init(A.timerDurations.theni2),
        window.location.hash ? G() : p(),
        document.getElementById('aiBtn')?.addEventListener('click', j));
}
function Z() {
    ((k = W.map((e, t) => {
        const n = document.createElement('div');
        return (
            (n.className = 'slide'),
            (n.id = `slide - ${t} `),
            (n.innerHTML = `
            <div class="category-badge">${e.category}</div>
            <div class="category-badge-ta">${e.category_ta}</div>
            <div class="difficulty-badge">${e.difficulty}</div>
            <div class="word-en">${e.word_en}</div>
            <div class="word-ta">${e.word_ta}</div>
        `),
            n
        );
    })),
        (a = [...k]));
}
function H(e) {
    return e
        ? e
              .replace(/[^a-zA-Z0-9 \-_]/g, '')
              .trim()
              .replace(/\s+/g, '_')
              .toLowerCase()
        : '';
}
function Q(e) {
    (e.stopPropagation(), document.getElementById('categoryMenu')?.classList.toggle('show'));
}
function X() {
    const e = new Map();
    (k.forEach((n) => {
        const o = n.querySelector('.category-badge')?.textContent,
            i = n.querySelector('.category-badge-ta')?.textContent,
            s = `${o} - ${i} `;
        e.has(s) || e.set(s, !0);
    }),
        (v = Array.from(e.keys())),
        (g = [...v]));
    const t = document.getElementById('categoryList');
    (t &&
        ((t.innerHTML = ''),
        v.forEach((n) => {
            const o = document.createElement('div');
            o.className = 'dropdown-item';
            const i = document.createElement('input');
            ((i.type = 'checkbox'), (i.checked = !0), (i.id = `cat - ${n} `));
            const s = document.createElement('span');
            ((s.innerText = n),
                o.appendChild(i),
                o.appendChild(s),
                o.addEventListener('click', (d) => {
                    (d.stopPropagation(), K(n));
                }),
                i.addEventListener('click', (d) => {
                    (d.stopPropagation(), K(n));
                }),
                t.appendChild(o));
        })),
        D());
}
function K(e) {
    const t = g.indexOf(e);
    t > -1 ? g.splice(t, 1) : g.push(e);
    const n = document.getElementById(`cat - ${e} `);
    (n && (n.checked = g.includes(e)), D(), C());
}
function Y(e) {
    const t = document.getElementById('selectAllCats');
    e.target !== t && (t.checked = !t.checked);
    const n = t.checked;
    (n ? (g = [...v]) : (g = []),
        document.querySelectorAll('#categoryList input').forEach((o) => {
            o.checked = n;
        }),
        D(),
        C());
}
function D() {
    const e = document.getElementById('selectedCatText'),
        t = document.getElementById('selectAllCats');
    !e ||
        !t ||
        (g.length === v.length
            ? ((e.textContent = 'All Categories'), (t.checked = !0))
            : g.length === 0
              ? ((e.textContent = 'None selected'), (t.checked = !1))
              : ((e.textContent = `${g.length} selected`), (t.checked = !1)));
}
function C(e = !0) {
    ((a = k.filter((t) => {
        const n = t.querySelector('.difficulty-badge')?.textContent,
            o = t.querySelector('.category-badge')?.textContent,
            i = t.querySelector('.category-badge-ta')?.textContent,
            s = `${o} - ${i} `,
            d = B === 'all' || n === B,
            h = g.includes(s);
        return d && h;
    })),
        L && O.shuffleArray(a),
        (b = {}),
        e && (l = 0),
        q(),
        p());
}
function I(e) {
    ((B = e), document.querySelectorAll('.pill-button').forEach((n) => n.classList.remove('active')));
    const t = document.getElementById(`filter${e === 'all' ? 'All' : e} `);
    (t && t.classList.add('active'), C());
}
function N() {
    ((L = !0), C());
}
function R() {
    ((L = !1), C());
}
function q() {
    const e = a.filter((s) => s.querySelector('.difficulty-badge')?.textContent === 'D1').length,
        t = a.filter((s) => s.querySelector('.difficulty-badge')?.textContent === 'D2').length,
        n = B === 'all' ? 'All Difficulty' : B,
        o = L ? ' (Shuffled)' : '',
        i = document.getElementById('progressInfo');
    i &&
        (i.textContent = `${a.length === 0 ? 0 : l + 1}/${a.length} slides - Filter: ${n}${o} (Matches: D1=${e}, D2=${t})`);
}
function ee(e) {
    localStorage.setItem('gemini_api_key', e);
    const t = document.getElementById('keyStatus');
    t && ((t.style.display = 'inline'), setTimeout(() => (t.style.display = 'none'), 3e3));
}
function te() {
    const e = localStorage.getItem('gemini_api_key');
    if (e) {
        const t = document.getElementById('apiKeyInput');
        t && (t.value = e);
    }
}
async function j() {
    const e = document.getElementById('aiBtn'),
        t = document.getElementById('aiResult'),
        n = document.getElementById('aiText'),
        o = document.getElementById('aiTextEn');
    w.pause();
    const i = document.getElementById('card1Ta')?.textContent,
        s = document.getElementById('card2Ta')?.textContent;
    if (!i || !s) {
        alert('Cannot generate sentence without two words.');
        return;
    }
    const d = localStorage.getItem('gemini_api_key');
    if (!d) {
        alert('Please enter your Gemini API Key in the settings first.');
        const c = document.getElementById('controlPanel');
        c && c.classList.contains('collapsed') && c.classList.remove('collapsed');
        return;
    }
    const h = d;
    if (!t || !n || !o) return;
    const y = `${i}|${s}`;
    if (S[y]) {
        const c = S[y];
        r(c);
        return;
    }
    (e && ((e.disabled = !0), (e.innerHTML = '<span>⏳</span> Generating...')),
        (t.style.display = 'none'),
        t.classList.remove('show'),
        (n.textContent = ''),
        (o.textContent = ''));
    const m = `Generate a simple Tamil sentence using these two words: "${i}" and "${s}".
    Provide the response in JSON format: { "tamil": "tamil sentence", "english": "english meaning" }
    IMPORTANT: Use the exact Tamil words provided. Keep it simple.`;
    try {
        const u = await (
            await fetch(`${A.gemini.baseUrl}/${A.gemini.defaultModel}:generateContent?key=${h}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: m }] }] }),
            })
        ).json();
        if (u.error) throw new Error(u.error.message || 'API Error');
        const E = u.candidates?.[0]?.content?.parts?.[0]?.text;
        if (E) {
            const z = E.replace(/```json\n?|\n?```/g, '').trim(),
                P = JSON.parse(z);
            ((S[y] = P), r(P));
        } else throw new Error('No response text');
    } catch (c) {
        const u = c instanceof Error ? c.message : 'Unknown error';
        (console.error('AI Error:', c), alert('Error generating sentence: ' + u), t && (t.style.display = 'none'));
    } finally {
        e && ((e.disabled = !1), (e.innerHTML = '<span>✨</span> Generate Sentence'));
    }
    function r(c) {
        ((n.textContent = c.tamil),
            (o.textContent = c.english),
            (t.style.display = 'flex'),
            setTimeout(() => t.classList.add('show'), 10),
            x && f.speak(c.tamil, 'ta-IN'));
    }
}
function ne() {
    if (((x = document.getElementById('audioToggle').checked), x)) {
        const t = a[l],
            n = b[l],
            o = n !== void 0 ? a[n] : null;
        if (t) {
            const i = t.querySelector('.word-en')?.textContent,
                s = o?.querySelector('.word-en')?.textContent;
            i &&
                (f.speak(i, 'en-US'),
                s &&
                    setTimeout(() => {
                        x && f.speak(s, 'en-US');
                    }, 1500));
        }
    } else f.synth && f.synth.speaking && f.synth.cancel();
}
function p() {
    const e = document.getElementById('aiResult'),
        t = document.getElementById('aiText'),
        n = document.getElementById('aiTextEn'),
        o = document.getElementById('aiBtn');
    if (
        (e && ((e.style.display = 'none'), e.classList.remove('show')),
        t && (t.textContent = ''),
        n && (n.textContent = ''),
        o && ((o.disabled = !1), (o.innerHTML = '<span>✨</span> Generate Sentence with AI')),
        document.getElementById('card1')?.classList.remove('revealed'),
        document.getElementById('card2')?.classList.remove('revealed'),
        a.length < 2)
    ) {
        (document.getElementById('card1En') && (document.getElementById('card1En').textContent = 'Not enough words'),
            T(2, document.createElement('div')));
        return;
    }
    const i = a[l];
    let s;
    if (b[l] !== void 0) s = b[l];
    else {
        do s = Math.floor(Math.random() * a.length);
        while (s === l);
        b[l] = s;
    }
    const d = a[s],
        y = d.querySelector('.slide-image')?.dataset.word || d.querySelector('.word-en')?.textContent?.toLowerCase();
    if (y) {
        const c = new Image();
        c.src = `assets/images/theni12/${H(y)}.jpg`;
    }
    if ((T(1, i), T(2, d), x)) {
        const c = i.querySelector('.word-en')?.textContent,
            u = d.querySelector('.word-en')?.textContent;
        c && (f.speak(c, 'en-US'), u && f.speak(u, 'en-US'));
    }
    ((document.getElementById('firstBtn').disabled = l === 0),
        (document.getElementById('prevBtn').disabled = l === 0),
        (document.getElementById('nextBtn').disabled = l === a.length - 1),
        (document.getElementById('lastBtn').disabled = l === a.length - 1));
    const m = document.getElementById('counter');
    (m && (m.innerText = `${l + 1} / ${a.length}`), O.updateProgress(l, a.length, 'progressBar', 'counter'), q());
    const r = document.getElementById('showTimer');
    r && r.checked && w.restart();
}
function T(e, t) {
    try {
        const n = 'card' + e,
            o = t.querySelector('.word-en')?.textContent || '',
            i = t.querySelector('.word-ta')?.textContent || '',
            s = t.querySelector('.category-badge')?.textContent || '',
            d = t.querySelector('.category-badge-ta')?.textContent || '',
            h = t.querySelector('.difficulty-badge')?.textContent || '',
            m = t.querySelector('.slide-image')?.dataset.word || o.toLowerCase();
        (document.getElementById(n + 'En') && (document.getElementById(n + 'En').textContent = o),
            document.getElementById(n + 'Ta') && (document.getElementById(n + 'Ta').textContent = i),
            document.getElementById(n + 'Cat') && (document.getElementById(n + 'Cat').textContent = s),
            document.getElementById(n + 'CatTa') && (document.getElementById(n + 'CatTa').textContent = d),
            document.getElementById(n + 'Diff') && (document.getElementById(n + 'Diff').textContent = h));
        const r = document.getElementById(n + 'Img');
        if (r) {
            const c = H(m);
            if (M[m]) r.src = M[m];
            else {
                const u = `assets/images/theni12/${c}.jpg`,
                    E = '/tamiltheni/' + u;
                ((r.src = E),
                    (r.onerror = function () {
                        if (((r.onerror = null), r.src.includes(E))) {
                            (console.warn(`[ImageLoad] Failed absolute path: ${E}. Retrying with relative...`),
                                (r.src = `../${u}`));
                            return;
                        }
                        r.src = `https://placehold.co/300x180?text=${encodeURIComponent(o)}`;
                    }));
            }
            r.alt = o;
        }
    } catch (n) {
        console.error('Error in updateCard ' + e + ':', n);
    }
}
function U() {
    a.length > 0 && ((l = 0), p());
}
function _() {
    a.length > 0 && ((l = a.length - 1), p());
}
function $(e) {
    const t = l + e;
    t >= 0 && t < a.length && ((l = t), p());
}
function F() {
    if (!a[l]) return;
    const e = document.getElementById('card1'),
        t = document.getElementById('card2');
    if (!e || !t) return;
    e.classList.contains('revealed') && t.classList.contains('revealed')
        ? $(1)
        : (e.classList.add('revealed'), t.classList.add('revealed'));
}
function G() {
    const e = window.location.hash.substring(1),
        t = `slide-${parseInt(e) - 1}`,
        n = a.findIndex((o) => o.id === t);
    n !== -1 ? ((l = n), p()) : a.length > 0 && (l >= a.length && (l = 0), p());
}
function oe() {
    (J.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 2',
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
                        <input type="checkbox" id="showTimer" checked> ⏱️ Timer (20s)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="audioToggle"> 🔊 Audio
                    </label>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Progress:</span>
                <span class="progress-info" id="progressInfo">Loading...</span>
                <div style="margin-left: auto; display: flex; gap: 10px; align-items: center;">
                    <label style="font-size: 0.85em; display: flex; align-items: center; gap: 6px;">🔑 Gemini AI API:</label>
                    <input type="password" id="apiKeyInput" placeholder="Enter API Key" 
                           style="padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.15); color: white; font-size: 0.85em; width: 140px;">
                    <style>#apiKeyInput::placeholder { color: rgba(255,255,255,0.7); font-style: italic; }</style>
                </div>
            </div>
        `,
        timerDisplay: '00:20',
        injectNavigation: !0,
    }),
        document.getElementById('cat-dropdown-btn')?.addEventListener('click', Q),
        document.getElementById('select-all-cat-row')?.addEventListener('click', Y),
        document.getElementById('filterAll')?.addEventListener('click', () => I('all')),
        document.getElementById('filterD1')?.addEventListener('click', () => I('D1')),
        document.getElementById('filterD2')?.addEventListener('click', () => I('D2')),
        document.getElementById('btn-shuffle')?.addEventListener('click', N),
        document.getElementById('btn-reset-seq')?.addEventListener('click', R),
        document.getElementById('showTimer')?.addEventListener('change', w.toggleVisibility.bind(w)),
        document.getElementById('audioToggle')?.addEventListener('change', ne),
        document.getElementById('firstBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), U());
        }),
        document.getElementById('prevBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), $(-1));
        }),
        document.getElementById('nextBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), F());
        }),
        document.getElementById('lastBtn')?.addEventListener('click', (e) => {
            (e.stopPropagation(), _());
        }),
        document.getElementById('apiKeyInput')?.addEventListener('change', (e) => ee(e.target.value)),
        document.getElementById('aiBtn')?.addEventListener('click', j),
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
            (e.key === 'ArrowLeft' && $(-1),
                (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') && F(),
                e.key === 'Home' && U(),
                e.key === 'End' && _(),
                e.key === '1' && I('D1'),
                e.key === '2' && I('D2'),
                (e.key === 'a' || e.key === 'A') && I('all'),
                (e.key === 's' || e.key === 'S') && N(),
                (e.key === 'r' || e.key === 'R') && R());
        }),
        window.addEventListener('hashchange', G),
        te(),
        V());
}
document.addEventListener('DOMContentLoaded', oe);
