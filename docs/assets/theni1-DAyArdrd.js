import"./pwa-DOeEgxuH.js";import{L as N,T as k,c as _,U as V}from"./config-fpOH8MM_.js";import{A as p}from"./audio_manager-CdHsL4ip.js";import{t as z}from"./theni_words-xXaqkVpm.js";let l=0,w=!0,C=!1,m=null,h="all",r=[],y=[],b=[],s=[],x=!1;const T=window.SpeechRecognition||window.webkitSpeechRecognition;let a=null,v=!1;T?(a=new T,a.lang="ta-IN",a.interimResults=!1,a.maxAlternatives=1,a.onresult=e=>{const t=e.results[0][0].transcript.trim();G(t)},a.onerror=e=>{e.error!=="no-speech"&&(console.error("Speech recognition error:",e.error),L("Error: "+e.error,"error")),g()},a.onend=()=>{v&&g()}):console.warn("Speech recognition not supported.");function H(){const e=document.getElementById("slides-wrapper");if(!e){console.error("Missing slides-wrapper");return}e.innerHTML="",z.forEach((t,i)=>{const n=document.createElement("div");n.className=i===0?"slide active":"slide",n.id=`slide-${i}`,n.style.display=i===0?"flex":"none",n.innerHTML=`
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
        `,e.appendChild(n);const o=n.querySelector(`#mic-btn-${i}`);o&&o.addEventListener("click",c=>{c.stopPropagation(),W()})}),b=Array.from(document.querySelectorAll(".slide")),s=[...b]}function U(e){e.stopPropagation(),document.getElementById("categoryMenu")?.classList.toggle("show")}function O(){const e=new Map;b.forEach(i=>{const n=i.querySelector(".category-badge")?.textContent,o=i.querySelector(".category-badge-ta")?.textContent,c=`${n} - ${o}`;e.has(c)||e.set(c,!0)}),y=Array.from(e.keys()),r=[...y];const t=document.getElementById("categoryList");t&&(t.innerHTML="",y.forEach(i=>{const n=document.createElement("div");n.className="dropdown-item";const o=document.createElement("input");o.type="checkbox",o.checked=!0,o.id=`cat-${i}`;const c=document.createElement("span");c.innerText=i,n.appendChild(o),n.appendChild(c),n.addEventListener("click",d=>{d.stopPropagation(),B(i)}),o.addEventListener("click",d=>{d.stopPropagation(),B(i)}),n.setAttribute("tabindex","0"),n.setAttribute("role","checkbox"),n.setAttribute("aria-checked","true"),n.addEventListener("keydown",d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),B(i))}),t.appendChild(n)}),A())}function B(e){const t=r.indexOf(e);t>-1?r.splice(t,1):r.push(e);const i=document.getElementById(`cat-${e}`);i&&(i.checked=r.includes(e)),document.querySelectorAll("#categoryList .dropdown-item").forEach(o=>{o.textContent===e&&o.setAttribute("aria-checked",r.includes(e).toString())}),A(),E()}function j(e){const t=document.getElementById("selectAllCats");e.target!==t&&(t.checked=!t.checked);const i=t.checked;i?r=[...y]:r=[],document.querySelectorAll("#categoryList input").forEach(n=>{n.checked=i}),A(),E()}function A(){const e=document.getElementById("selectedCatText"),t=document.getElementById("selectAllCats");!e||!t||(r.length===y.length?(e.textContent="All Categories",t.checked=!0):r.length===0?(e.textContent="None selected",t.checked=!1):(e.textContent=`${r.length} selected`,t.checked=!1))}function E(e=!0){s=b.filter(t=>{const i=t.querySelector(".difficulty-badge")?.textContent,n=t.querySelector(".category-badge")?.textContent,o=t.querySelector(".category-badge-ta")?.textContent,c=`${n} - ${o}`,d=h==="all"||i===h,F=r.includes(c);return d&&F}),x&&V.shuffleArray(s),e&&(l=0),$(),u()}function f(e){h=e,document.querySelectorAll(".pill-button").forEach(i=>{i.classList.remove("active"),i.setAttribute("aria-pressed","false")});const t=document.getElementById(`filter${e==="all"?"All":e}`);t&&(t.classList.add("active"),t.setAttribute("aria-pressed","true")),E()}function q(){x=!0;const e=document.getElementById("btn-shuffle");e&&(e.classList.add("active"),e.setAttribute("aria-pressed","true")),E()}function D(){x=!1;const e=document.getElementById("btn-shuffle");e&&(e.classList.remove("active"),e.setAttribute("aria-pressed","false")),E()}function $(){const e=s.filter(c=>c.querySelector(".difficulty-badge")?.textContent==="D1").length,t=s.filter(c=>c.querySelector(".difficulty-badge")?.textContent==="D2").length,i=h==="all"?"All Difficulty":h,n=x?" (Shuffled)":"",o=document.getElementById("progressInfo");o&&(o.textContent=`${s.length===0?0:l+1}/${s.length} slides - Filter: ${i}${n} (Matches: D1=${e}, D2=${t})`)}function K(e,t){if(!e)return;const n=`assets/images/theni12/${e.replace(/[^a-zA-Z0-9 \-_]/g,"").trim().replace(/\s+/g,"_")}.jpg`,o="/tamiltheni/"+n.replace(/^assets\//,"assets/");t.onerror=function(){if(t.onerror=null,t.src.includes(o)){console.warn(`[ImageLoad] Failed absolute path: ${o}. Retrying with relative...`),t.src=`../${n}`;return}console.warn(`Missing local image for: ${e} (${o})`),t.src=`https://placehold.co/400x300?text=${encodeURIComponent(e)}`},t.src=o}function W(){if(!a){alert("Speech recognition is not supported in this browser.");return}v?g():Z()}function Z(){if(a)try{a.start(),v=!0;const t=s[l]?.querySelector(".mic-button-inline");t&&(t.classList.add("recording"),t.setAttribute("title","Voice Validation is ACTIVE - Click to Stop Listening")),L("Listening for Tamil...","success")}catch(e){console.error("Recognition start error:",e)}}function g(){a&&v&&a.stop(),v=!1,document.querySelectorAll(".mic-button-inline.recording").forEach(e=>{e.classList.remove("recording"),e.setAttribute("title","Voice Validation - Click to Start Listening")})}function G(e){const t=s[l];if(!t)return;const i=t.querySelector(".word-ta")?.textContent?.trim()||"",n=d=>d.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").replace(/\s+/g,""),o=n(e),c=n(i);o===c||c.includes(o)||o.includes(c)?(L(`Correct! ✅ (${e})`,"success"),t.classList.add("revealed")):L(`Heard "${e}" ❌`,"error"),g()}function L(e,t){const n=s[l]?.querySelector(".voice-feedback-inline");n&&(n.textContent=e,n.className=`voice-feedback-inline ${t}`,t!=="recording"&&!e.includes("Listening")&&setTimeout(()=>{n.textContent===e&&(n.className="voice-feedback-inline",n.textContent="")},4e3))}function J(){if(w=document.getElementById("audioToggle").checked,w){const t=s[l];if(t){const i=t.querySelector(".word-en");i&&i.textContent&&p.speak(i.textContent,"en-US")}}else m&&clearTimeout(m),p.synth&&p.synth.speaking&&p.synth.cancel()}function Q(){C=document.getElementById("voiceToggle").checked,document.querySelectorAll(".mic-button-inline").forEach(t=>{t.style.display=C?"flex":"none"}),C||(document.querySelectorAll(".voice-feedback-inline").forEach(t=>{t.textContent="",t.className="voice-feedback-inline"}),g())}function u(e=!0){b.forEach(t=>{t.classList.remove("active"),t.style.display="none",t.style.visibility="hidden"}),s.forEach((t,i)=>{if(t.style.display=i===l?"flex":"none",t.style.visibility=i===l?"visible":"hidden",i===l){t.classList.add("active");const n=t.querySelector(".slide-image");n&&n.dataset.word&&!n.dataset.loaded&&(K(n.dataset.word,n),n.dataset.loaded="true");const o=t.querySelector(".word-en");o&&o.textContent&&(m&&clearTimeout(m),w&&e&&(m=setTimeout(()=>{w&&o.textContent&&p.speak(o.textContent,"en-US")},300))),g()}else t.classList.remove("revealed")}),document.getElementById("firstBtn").disabled=l===0,document.getElementById("prevBtn").disabled=l===0,document.getElementById("nextBtn").disabled=l===s.length-1,document.getElementById("lastBtn").disabled=l===s.length-1,V.updateProgress(l,s.length,"progressBar","counter"),$(),document.getElementById("showTimer").checked&&k.restart()}function M(){s.length>0&&(l=0,u())}function R(){s.length>0&&(l=s.length-1,u())}function I(e){const t=l+e;t>=0&&t<s.length&&(l=t,u())}function S(){s[l]&&(s[l].classList.contains("revealed")?I(1):s[l].classList.add("revealed"))}function P(){const e=window.location.hash.substring(1),t=`slide-${parseInt(e)-1}`,i=s.findIndex(n=>n.id===t);i!==-1?(l=i,u()):s.length>0&&(l>=s.length&&(l=0),u())}function X(){N.init({title:"பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1",contentHTML:`
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
        `,timerDisplay:"00:08",injectNavigation:!0}),document.getElementById("cat-dropdown-btn")?.addEventListener("click",U),document.getElementById("select-all-cat-row")?.addEventListener("click",j),document.getElementById("filterAll")?.addEventListener("click",()=>f("all")),document.getElementById("filterD1")?.addEventListener("click",()=>f("D1")),document.getElementById("filterD2")?.addEventListener("click",()=>f("D2")),document.getElementById("btn-shuffle")?.addEventListener("click",q),document.getElementById("btn-reset-seq")?.addEventListener("click",D),document.getElementById("showTimer")?.addEventListener("change",k.toggleVisibility.bind(k)),document.getElementById("audioToggle")?.addEventListener("change",J),document.getElementById("voiceToggle")?.addEventListener("change",Q),document.getElementById("firstBtn")?.addEventListener("click",e=>{e.stopPropagation(),M()}),document.getElementById("prevBtn")?.addEventListener("click",e=>{e.stopPropagation(),I(-1)}),document.getElementById("nextBtn")?.addEventListener("click",e=>{e.stopPropagation(),S()}),document.getElementById("lastBtn")?.addEventListener("click",e=>{e.stopPropagation(),R()}),document.getElementById("slides-wrapper")?.addEventListener("click",e=>{e.target.closest("button, input, .control-panel")||S()}),document.addEventListener("click",e=>{if(e.target.closest(".category-dropdown")||document.getElementById("categoryMenu")?.classList.remove("show"),!e.target.closest(".control-panel")){const t=document.getElementById("controlPanel");t&&!t.classList.contains("collapsed")&&t.classList.add("collapsed")}}),document.addEventListener("keydown",e=>{e.key==="ArrowLeft"&&I(-1),(e.key==="ArrowRight"||e.key===" "||e.key==="Enter")&&S(),e.key==="Home"&&M(),e.key==="End"&&R(),e.key==="1"&&f("D1"),e.key==="2"&&f("D2"),(e.key==="a"||e.key==="A")&&f("all"),(e.key==="s"||e.key==="S")&&q(),(e.key==="r"||e.key==="R")&&D()}),window.addEventListener("hashchange",P),H(),O(),k.init(_.timerDurations.theni1),$(),window.location.hash?P():u(!0)}document.addEventListener("DOMContentLoaded",X);
