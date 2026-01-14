import"./pwa-BpJqPPdR.js";import{L as N,T as k,c as _,U as V}from"./config-U83h9fBs.js";import{A as p}from"./audio_manager-scbDJZwj.js";import{t as z}from"./theni_words-xXaqkVpm.js";let l=0,w=!0,C=!1,m=null,y="all",r=[],h=[],v=[],i=[],L=!1;const $=window.SpeechRecognition||window.webkitSpeechRecognition;let a=null,b=!1;$?(a=new $,a.lang="ta-IN",a.interimResults=!1,a.maxAlternatives=1,a.onresult=e=>{const t=e.results[0][0].transcript.trim();G(t)},a.onerror=e=>{e.error!=="no-speech"&&(console.error("Speech recognition error:",e.error),x("Error: "+e.error,"error")),f()},a.onend=()=>{b&&f()}):console.warn("Speech recognition not supported.");function H(){const e=document.getElementById("slides-wrapper");if(!e){console.error("Missing slides-wrapper");return}e.innerHTML="",z.forEach((t,n)=>{const o=document.createElement("div");o.className=n===0?"slide active":"slide",o.id=`slide-${n}`,o.style.display=n===0?"flex":"none",o.innerHTML=`
            <div class="image-container">
                <img src="https://placehold.co/400x300?text=Loading..."
                     data-word="${t.image_word}"
                     alt="${t.word_en}"
                     class="slide-image">
            </div>
            <div class="word-row">
                <div class="word-en">${t.word_en}</div>
                <button class="mic-button-inline" id="mic-btn-${n}" title="Voice Validation">🎤</button>
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
        `,e.appendChild(o);const c=o.querySelector(`#mic-btn-${n}`);c&&c.addEventListener("click",s=>{s.stopPropagation(),W()})}),v=Array.from(document.querySelectorAll(".slide")),i=[...v]}function U(e){e.stopPropagation(),document.getElementById("categoryMenu")?.classList.toggle("show")}function O(){const e=new Map;v.forEach(n=>{const o=n.querySelector(".category-badge")?.textContent,c=n.querySelector(".category-badge-ta")?.textContent,s=`${o} - ${c} `;e.has(s)||e.set(s,!0)}),h=Array.from(e.keys()),r=[...h];const t=document.getElementById("categoryList");t&&(t.innerHTML="",h.forEach(n=>{const o=document.createElement("div");o.className="dropdown-item";const c=document.createElement("input");c.type="checkbox",c.checked=!0,c.id=`cat - ${n} `;const s=document.createElement("span");s.innerText=n,o.appendChild(c),o.appendChild(s),o.addEventListener("click",d=>{d.stopPropagation(),A(n)}),c.addEventListener("click",d=>{d.stopPropagation(),A(n)}),t.appendChild(o)}),S())}function A(e){const t=r.indexOf(e);t>-1?r.splice(t,1):r.push(e);const n=document.getElementById(`cat - ${e} `);n&&(n.checked=r.includes(e)),S(),E()}function j(e){const t=document.getElementById("selectAllCats");e.target!==t&&(t.checked=!t.checked);const n=t.checked;n?r=[...h]:r=[],document.querySelectorAll("#categoryList input").forEach(o=>{o.checked=n}),S(),E()}function S(){const e=document.getElementById("selectedCatText"),t=document.getElementById("selectAllCats");!e||!t||(r.length===h.length?(e.textContent="All Categories",t.checked=!0):r.length===0?(e.textContent="None selected",t.checked=!1):(e.textContent=`${r.length} selected`,t.checked=!1))}function E(e=!0){i=v.filter(t=>{const n=t.querySelector(".difficulty-badge")?.textContent,o=t.querySelector(".category-badge")?.textContent,c=t.querySelector(".category-badge-ta")?.textContent,s=`${o} - ${c} `,d=y==="all"||n===y,F=r.includes(s);return d&&F}),L&&V.shuffleArray(i),e&&(l=0),B(),u()}function g(e){y=e,document.querySelectorAll(".pill-button").forEach(t=>t.classList.remove("active")),document.getElementById(`filter${e==="all"?"All":e} `)?.classList.add("active"),E()}function T(){L=!0,E()}function q(){L=!1,E()}function B(){const e=i.filter(s=>s.querySelector(".difficulty-badge")?.textContent==="D1").length,t=i.filter(s=>s.querySelector(".difficulty-badge")?.textContent==="D2").length;let n=y==="all"?"All Difficulty":y,o=L?" (Shuffled)":"";const c=document.getElementById("progressInfo");c&&(c.textContent=`${i.length===0?0:l+1}/${i.length} slides - Filter: ${n}${o} (Matches: D1=${e}, D2=${t})`)}function K(e,t){if(!e)return;const o=`assets/images/theni12/${e.replace(/[^a-zA-Z0-9 \-_]/g,"").trim().replace(/\s+/g,"_")}.jpg`,c="/tamiltheni/"+o.replace(/^assets\//,"assets/");t.onerror=function(){if(t.onerror=null,t.src.includes(c)){console.warn(`[ImageLoad] Failed absolute path: ${c}. Retrying with relative...`),t.src=`../${o}`;return}console.warn(`Missing local image for: ${e} (${c})`),t.src=`https://placehold.co/400x300?text=${encodeURIComponent(e)}`},t.src=c}function W(){if(!a){alert("Speech recognition is not supported in this browser.");return}b?f():Z()}function Z(){try{a.start(),b=!0;const t=i[l]?.querySelector(".mic-button-inline");t&&(t.classList.add("recording"),t.setAttribute("title","Voice Validation is ACTIVE - Click to Stop Listening")),x("Listening for Tamil...","success")}catch(e){console.error("Recognition start error:",e)}}function f(){a&&b&&a.stop(),b=!1,document.querySelectorAll(".mic-button-inline.recording").forEach(e=>{e.classList.remove("recording"),e.setAttribute("title","Voice Validation - Click to Start Listening")})}function G(e){const t=i[l];if(!t)return;const n=t.querySelector(".word-ta")?.textContent?.trim()||"",o=d=>d.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g,""),c=o(e),s=o(n);c===s||s.includes(c)||c.includes(s)?(x(`Correct! ✅ (${e})`,"success"),t.classList.add("revealed")):x(`Heard "${e}" ❌`,"error"),f()}function x(e,t){const o=i[l]?.querySelector(".voice-feedback-inline");o&&(o.textContent=e,o.className=`voice-feedback-inline ${t}`,t!=="recording"&&!e.includes("Listening")&&setTimeout(()=>{o.textContent===e&&(o.className="voice-feedback-inline",o.textContent="")},4e3))}function J(){if(w=document.getElementById("audioToggle").checked,w){const t=i[l];if(t){const n=t.querySelector(".word-en");n&&n.textContent&&p.speak(n.textContent,"en-US")}}else m&&clearTimeout(m),p.synth&&p.synth.speaking&&p.synth.cancel()}function Q(){C=document.getElementById("voiceToggle").checked,document.querySelectorAll(".mic-button-inline").forEach(t=>{t.style.display=C?"flex":"none"}),C||(document.querySelectorAll(".voice-feedback-inline").forEach(t=>{t.textContent="",t.className="voice-feedback-inline"}),f())}function u(){if(v.forEach(e=>{e.classList.remove("active"),e.style.display="none"}),i.forEach((e,t)=>{if(e.style.display=t===l?"flex":"none",t===l){e.classList.add("active");const n=e.querySelector(".slide-image");n&&n.dataset.word&&!n.dataset.loaded&&(K(n.dataset.word,n),n.dataset.loaded="true");const o=e.querySelector(".word-en");o&&o.textContent&&(m&&clearTimeout(m),w&&(m=setTimeout(()=>{w&&o.textContent&&p.speak(o.textContent,"en-US")},300))),f()}else e.classList.remove("revealed")}),document.getElementById("firstBtn").disabled=l===0,document.getElementById("prevBtn").disabled=l===0,document.getElementById("nextBtn").disabled=l===i.length-1,document.getElementById("lastBtn").disabled=l===i.length-1,V.updateProgress(l,i.length,"progressBar","counter"),B(),i[l]){const e=i[l].id.replace("slide-",""),t=`#${parseInt(e)+1}`;window.location.hash!==t&&window.history.replaceState(null,"",t)}document.getElementById("showTimer").checked&&k.restart()}function D(){i.length>0&&(l=0,u())}function M(){i.length>0&&(l=i.length-1,u())}function I(e){const t=l+e;t>=0&&t<i.length&&(l=t,u())}function R(){i[l]&&(i[l].classList.contains("revealed")?I(1):i[l].classList.add("revealed"))}function P(){const e=window.location.hash.substring(1),t=`slide-${parseInt(e)-1}`,n=i.findIndex(o=>o.id===t);n!==-1?(l=n,u()):i.length>0&&(l>=i.length&&(l=0),u())}document.addEventListener("DOMContentLoaded",()=>{N.init({title:"பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1",contentHTML:`
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
        `,timerDisplay:"00:08",injectNavigation:!0}),document.getElementById("cat-dropdown-btn")?.addEventListener("click",U),document.getElementById("select-all-cat-row")?.addEventListener("click",j),document.getElementById("filterAll")?.addEventListener("click",()=>g("all")),document.getElementById("filterD1")?.addEventListener("click",()=>g("D1")),document.getElementById("filterD2")?.addEventListener("click",()=>g("D2")),document.getElementById("btn-shuffle")?.addEventListener("click",T),document.getElementById("btn-reset-seq")?.addEventListener("click",q),document.getElementById("showTimer")?.addEventListener("change",k.toggleVisibility.bind(k)),document.getElementById("audioToggle")?.addEventListener("change",J),document.getElementById("voiceToggle")?.addEventListener("change",Q),document.getElementById("firstBtn")?.addEventListener("click",e=>{e.stopPropagation(),D()}),document.getElementById("prevBtn")?.addEventListener("click",e=>{e.stopPropagation(),I(-1)}),document.getElementById("nextBtn")?.addEventListener("click",e=>{e.stopPropagation(),R()}),document.getElementById("lastBtn")?.addEventListener("click",e=>{e.stopPropagation(),M()}),document.addEventListener("click",e=>{if(e.target.closest(".category-dropdown")||document.getElementById("categoryMenu")?.classList.remove("show"),!e.target.closest(".control-panel")){const t=document.getElementById("controlPanel");t&&!t.classList.contains("collapsed")&&t.classList.add("collapsed")}}),document.addEventListener("keydown",e=>{e.key==="ArrowLeft"&&I(-1),(e.key==="ArrowRight"||e.key===" "||e.key==="Enter")&&R(),e.key==="Home"&&D(),e.key==="End"&&M(),e.key==="1"&&g("D1"),e.key==="2"&&g("D2"),(e.key==="a"||e.key==="A")&&g("all"),(e.key==="s"||e.key==="S")&&T(),(e.key==="r"||e.key==="R")&&q()}),window.addEventListener("hashchange",P),H(),O(),k.init(_.timerDurations.theni1),B(),window.location.hash?P():u()});
