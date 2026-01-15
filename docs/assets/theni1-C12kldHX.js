import"./pwa-DOeEgxuH.js";import{L as _,T as w,c as z,U as F}from"./config-CIWGv3Gd.js";import{A as m}from"./audio_manager-CdHsL4ip.js";import{t as H}from"./theni_words-xXaqkVpm.js";let l=0,g=!0,C=!1,y=null,b="all",r=[],h=[],v=[],s=[],L=!1;const T=window.SpeechRecognition||window.webkitSpeechRecognition;let a=null,E=!1;T?(a=new T,a.lang="ta-IN",a.interimResults=!1,a.maxAlternatives=1,a.onresult=e=>{const t=e.results[0][0].transcript.trim();J(t)},a.onerror=e=>{e.error!=="no-speech"&&(console.error("Speech recognition error:",e.error),x("Error: "+e.error,"error")),p()},a.onend=()=>{E&&p()}):console.warn("Speech recognition not supported.");function U(){const e=document.getElementById("slides-wrapper");if(!e){console.error("Missing slides-wrapper");return}e.innerHTML="",H.forEach((t,i)=>{const n=document.createElement("div");n.className=i===0?"slide active":"slide",n.id=`slide-${i}`,n.style.display=i===0?"flex":"none",n.innerHTML=`
            <div class="image-container">
                <img src="https://placehold.co/400x300?text=Loading..."
                     data-word="${t.image_word}"
                     alt="${t.word_en}"
                     class="slide-image">
            </div>
            <div class="word-row">
                <div class="word-en">${t.word_en}</div>
                <button class="mic-button-inline" id="mic-btn-${i}" title="Voice Validation" aria-label="Start Voice Validation">🎤</button>
                <span class="voice-feedback-inline" role="status" aria-live="polite"></span>
            </div>
            <div class="word-ta">${t.word_ta}</div>
            <div class="card-footer">
                <div class="footer-left">
                    <span class="category-badge">${t.category}</span>
                    <span class="category-badge-ta">${t.category_ta}</span>
                    <span class="difficulty-badge">${t.difficulty}</span>
                </div>
            </div>
        `,e.appendChild(n);const o=n.querySelector(`#mic-btn-${i}`);o&&o.addEventListener("click",c=>{c.stopPropagation(),Z()})}),v=Array.from(document.querySelectorAll(".slide")),s=[...v]}function O(e){e.stopPropagation(),document.getElementById("categoryMenu")?.classList.toggle("show")}function j(){const e=new Map;v.forEach(i=>{const n=i.querySelector(".category-badge")?.textContent,o=i.querySelector(".category-badge-ta")?.textContent,c=`${n} - ${o}`;e.has(c)||e.set(c,!0)}),h=Array.from(e.keys()),r=[...h];const t=document.getElementById("categoryList");t&&(t.innerHTML="",h.forEach(i=>{const n=document.createElement("div");n.className="dropdown-item";const o=document.createElement("input");o.type="checkbox",o.checked=!0,o.id=`cat-${i}`;const c=document.createElement("span");c.innerText=i,n.appendChild(o),n.appendChild(c),n.addEventListener("click",d=>{d.stopPropagation(),B(i)}),o.addEventListener("click",d=>{d.stopPropagation(),B(i)}),n.setAttribute("tabindex","0"),n.setAttribute("role","checkbox"),n.setAttribute("aria-checked","true"),n.addEventListener("keydown",d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),B(i))}),t.appendChild(n)}),A())}function B(e){const t=r.indexOf(e);t>-1?r.splice(t,1):r.push(e);const i=document.getElementById(`cat-${e}`);i&&(i.checked=r.includes(e)),document.querySelectorAll("#categoryList .dropdown-item").forEach(o=>{o.textContent===e&&o.setAttribute("aria-checked",r.includes(e).toString())}),A(),k()}function K(e){const t=document.getElementById("selectAllCats");e.target!==t&&(t.checked=!t.checked);const i=t.checked;i?r=[...h]:r=[],document.querySelectorAll("#categoryList input").forEach(n=>{n.checked=i}),A(),k()}function A(){const e=document.getElementById("selectedCatText"),t=document.getElementById("selectAllCats");!e||!t||(r.length===h.length?(e.textContent="All Categories",t.checked=!0):r.length===0?(e.textContent="None selected",t.checked=!1):(e.textContent=`${r.length} selected`,t.checked=!1))}function k(e=!0){s=v.filter(t=>{const i=t.querySelector(".difficulty-badge")?.textContent,n=t.querySelector(".category-badge")?.textContent,o=t.querySelector(".category-badge-ta")?.textContent,c=`${n} - ${o}`,d=b==="all"||i===b,N=r.includes(c);return d&&N}),L&&F.shuffleArray(s),e&&(l=0),$(),u()}function f(e){b=e,document.querySelectorAll(".pill-button").forEach(i=>{i.classList.remove("active"),i.setAttribute("aria-pressed","false")});const t=document.getElementById(`filter${e==="all"?"All":e}`);t&&(t.classList.add("active"),t.setAttribute("aria-pressed","true")),k()}function q(){L=!0;const e=document.getElementById("btn-shuffle");e&&(e.classList.add("active"),e.setAttribute("aria-pressed","true")),k()}function D(){L=!1;const e=document.getElementById("btn-shuffle");e&&(e.classList.remove("active"),e.setAttribute("aria-pressed","false")),k()}function $(){const e=s.filter(c=>c.querySelector(".difficulty-badge")?.textContent==="D1").length,t=s.filter(c=>c.querySelector(".difficulty-badge")?.textContent==="D2").length,i=b==="all"?"All Difficulty":b,n=L?" (Shuffled)":"",o=document.getElementById("progressInfo");o&&(o.textContent=`${s.length===0?0:l+1}/${s.length} slides - Filter: ${i}${n} (Matches: D1=${e}, D2=${t})`)}function W(e,t){if(!e)return;const n=`assets/images/theni12/${e.replace(/[^a-zA-Z0-9 \-_]/g,"").trim().replace(/\s+/g,"_")}.jpg`,o="/tamiltheni/"+n.replace(/^assets\//,"assets/");t.onerror=function(){if(t.onerror=null,t.src.includes(o)){console.warn(`[ImageLoad] Failed absolute path: ${o}. Retrying with relative...`),t.src=`../${n}`;return}console.warn(`Missing local image for: ${e} (${o})`),t.src=`https://placehold.co/400x300?text=${encodeURIComponent(e)}`},t.src=o}function Z(){if(!a){alert("Speech recognition is not supported in this browser.");return}E?p():G()}function G(){if(a)try{a.start(),E=!0;const t=s[l]?.querySelector(".mic-button-inline");t&&(t.classList.add("recording"),t.setAttribute("title","Voice Validation is ACTIVE - Click to Stop Listening")),x("Listening for Tamil...","success")}catch(e){console.error("Recognition start error:",e)}}function p(){a&&E&&a.stop(),E=!1,document.querySelectorAll(".mic-button-inline.recording").forEach(e=>{e.classList.remove("recording"),e.setAttribute("title","Voice Validation - Click to Start Listening")})}function J(e){const t=s[l];if(!t)return;const i=t.querySelector(".word-ta")?.textContent?.trim()||"",n=d=>d.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").replace(/\s+/g,""),o=n(e),c=n(i);o===c||c.includes(o)||o.includes(c)?(x(`Correct! ✅ (${e})`,"success"),t.classList.add("revealed")):x(`Heard "${e}" ❌`,"error"),p()}function x(e,t){const n=s[l]?.querySelector(".voice-feedback-inline");n&&(n.textContent=e,n.className=`voice-feedback-inline ${t}`,t!=="recording"&&!e.includes("Listening")&&setTimeout(()=>{n.textContent===e&&(n.className="voice-feedback-inline",n.textContent="")},4e3))}function M(){if(g=document.getElementById("audioToggle").checked,g){const t=s[l];if(t){const i=t.querySelector(".word-en");i&&i.textContent&&m.speak(i.textContent,"en-US")}}else y&&clearTimeout(y),m.synth&&m.synth.speaking&&m.synth.cancel()}function Q(){C=document.getElementById("voiceToggle").checked,document.querySelectorAll(".mic-button-inline").forEach(t=>{t.style.display=C?"flex":"none"}),C||(document.querySelectorAll(".voice-feedback-inline").forEach(t=>{t.textContent="",t.className="voice-feedback-inline"}),p())}function u(e=!0){v.forEach(t=>{t.classList.remove("active"),t.style.display="none",t.style.visibility="hidden"}),s.forEach((t,i)=>{if(t.style.display=i===l?"flex":"none",t.style.visibility=i===l?"visible":"hidden",i===l){t.classList.add("active");const n=t.querySelector(".slide-image");n&&n.dataset.word&&!n.dataset.loaded&&(W(n.dataset.word,n),n.dataset.loaded="true");const o=t.querySelector(".word-en");o&&o.textContent&&(y&&clearTimeout(y),g&&e&&(y=setTimeout(()=>{g&&o.textContent&&m.speak(o.textContent,"en-US")},300))),p()}else t.classList.remove("revealed")}),document.getElementById("firstBtn").disabled=l===0,document.getElementById("prevBtn").disabled=l===0,document.getElementById("nextBtn").disabled=l===s.length-1,document.getElementById("lastBtn").disabled=l===s.length-1,F.updateProgress(l,s.length,"progressBar","counter"),$(),document.getElementById("showTimer").checked&&w.restart()}function R(){s.length>0&&(l=0,u())}function P(){s.length>0&&(l=s.length-1,u())}function S(e){const t=l+e;t>=0&&t<s.length&&(l=t,u())}function I(){s[l]&&(s[l].classList.contains("revealed")?S(1):s[l].classList.add("revealed"))}function V(){const e=window.location.hash.substring(1),t=`slide-${parseInt(e)-1}`,i=s.findIndex(n=>n.id===t);i!==-1?(l=i,u()):s.length>0&&(l>=s.length&&(l=0),u())}function X(){_.init({title:"பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1",contentHTML:`
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
                <div class="pill-group">
                    <button class="pill-button active" id="filterAll" aria-pressed="true">All</button>
                    <button class="pill-button" id="filterD1" aria-pressed="false">D1 Only</button>
                    <button class="pill-button" id="filterD2" aria-pressed="false">D2 Only</button>
                </div>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Sequence:</span>
                <div class="pill-group">
                    <button class="action-button" id="btn-shuffle" aria-pressed="false"><span aria-hidden="true">🔀</span> Shuffle</button>
                    <button class="action-button" id="btn-reset-seq"><span aria-hidden="true">↩️</span> Reset</button>
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
        `,timerDisplay:"00:08",injectNavigation:!0}),document.getElementById("cat-dropdown-btn")?.addEventListener("click",O),document.getElementById("select-all-cat-row")?.addEventListener("click",K),document.getElementById("filterAll")?.addEventListener("click",()=>f("all")),document.getElementById("filterD1")?.addEventListener("click",()=>f("D1")),document.getElementById("filterD2")?.addEventListener("click",()=>f("D2")),document.getElementById("btn-shuffle")?.addEventListener("click",q),document.getElementById("btn-reset-seq")?.addEventListener("click",D),document.getElementById("showTimer")?.addEventListener("change",w.toggleVisibility.bind(w)),document.getElementById("audioToggle")?.addEventListener("change",M),document.getElementById("voiceToggle")?.addEventListener("change",Q),document.addEventListener("panelCollapsed",()=>{document.getElementById("audioToggle")?.checked&&!g&&(g=!0,M())}),document.getElementById("firstBtn")?.addEventListener("click",e=>{e.stopPropagation(),R()}),document.getElementById("prevBtn")?.addEventListener("click",e=>{e.stopPropagation(),S(-1)}),document.getElementById("nextBtn")?.addEventListener("click",e=>{e.stopPropagation(),I()}),document.getElementById("lastBtn")?.addEventListener("click",e=>{e.stopPropagation(),P()}),document.getElementById("slides-wrapper")?.addEventListener("click",e=>{e.target.closest("button, input, .control-panel")||I()}),document.addEventListener("click",e=>{if(e.target.closest(".category-dropdown")||document.getElementById("categoryMenu")?.classList.remove("show"),!e.target.closest(".control-panel")){const t=document.getElementById("controlPanel");t&&!t.classList.contains("collapsed")&&t.classList.add("collapsed")}}),document.addEventListener("keydown",e=>{e.key==="ArrowLeft"&&S(-1),(e.key==="ArrowRight"||e.key===" "||e.key==="Enter")&&I(),e.key==="Home"&&R(),e.key==="End"&&P(),e.key==="1"&&f("D1"),e.key==="2"&&f("D2"),(e.key==="a"||e.key==="A")&&f("all"),(e.key==="s"||e.key==="S")&&q(),(e.key==="r"||e.key==="R")&&D()}),window.addEventListener("hashchange",V),U(),j(),w.init(z.timerDurations.theni1),$(),window.location.hash?V():u(!1)}document.addEventListener("DOMContentLoaded",X);
