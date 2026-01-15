import"./pwa-DOeEgxuH.js";import{L as P,T as g,c as B,U as D}from"./config-CaEWjjzJ.js";import{t as S}from"./theni_words-xXaqkVpm.js";let i=0,A=3,r="all",d=[],m=[],b=[],s=[],y=!1;function q(){const e=document.getElementById("slides-wrapper");e&&(e.innerHTML="",S.forEach((t,n)=>{const l=document.createElement("div");l.className=n===0?"slide active":"slide",l.id=`slide-${n}`;const c=t.sentence_en||t.word_en,o=t.sentence_ta||t.word_ta;l.innerHTML=`
            <div class="slide-content">
                <div class="slide-header">
                    <span class="category-badge">${t.category}</span>
                    <span class="category-badge-ta">${t.category_ta}</span>
                    <span class="difficulty-badge">${t.difficulty}</span>
                </div>
                <div class="slide-body">
                    <div class="word-en">${c}</div>
                    <div class="word-ta">${o}</div>
                </div>
            </div>
        `,e.appendChild(l)}),b=Array.from(document.querySelectorAll(".slide")))}function F(e){e.stopPropagation(),document.getElementById("categoryMenu")?.classList.toggle("show")}document.addEventListener("click",e=>{if(e.target.closest(".category-dropdown")||document.getElementById("categoryMenu")?.classList.remove("show"),!e.target.closest(".control-panel")){const t=document.getElementById("controlPanel");t&&!t.classList.contains("collapsed")&&t.classList.add("collapsed")}});function H(){const e=new Map;S.forEach(n=>{const l=`${n.category} - ${n.category_ta}`;e.has(l)||e.set(l,!0)}),m=Array.from(e.keys()),d=[...m];const t=document.getElementById("categoryList");t&&(t.innerHTML="",m.forEach(n=>{const l=document.createElement("div");l.className="dropdown-item";const c=document.createElement("input");c.type="checkbox",c.checked=!0,c.id=`cat-${n}`;const o=document.createElement("span");o.innerText=n,l.appendChild(c),l.appendChild(o),l.addEventListener("click",a=>{a.stopPropagation(),I(n)}),c.addEventListener("click",a=>{a.stopPropagation(),I(n)}),t.appendChild(l)}),L())}function I(e){const t=d.indexOf(e);t>-1?d.splice(t,1):d.push(e);const n=document.getElementById(`cat-${e}`);n&&(n.checked=d.includes(e)),L(),p()}function N(e){const t=document.getElementById("selectAllCats");e.target!==t&&(t.checked=!t.checked);const n=t.checked;n?d=[...m]:d=[],document.querySelectorAll("#categoryList input").forEach(l=>{l.checked=n}),L(),p()}function L(){const e=document.getElementById("selectedCatText"),t=document.getElementById("selectAllCats");!e||!t||(d.length===m.length?(e.textContent="All Categories",t.checked=!0):d.length===0?(e.textContent="None selected",t.checked=!1):(e.textContent=`${d.length} selected`,t.checked=!1))}function p(e=!0){s=b.filter(t=>{const n=t.querySelector(".difficulty-badge")?.textContent,l=t.querySelector(".category-badge")?.textContent,c=t.querySelector(".category-badge-ta")?.textContent,o=`${l} - ${c}`,a=r==="all"||n===r,M=d.includes(o);return a&&M}),y&&D.shuffleArray(s),e&&(i=0),k(),u()}function f(e){r=e,document.querySelectorAll(".pill-button").forEach(n=>n.classList.remove("active")),document.getElementById(`filter${e==="all"?"All":e}`)?.classList.add("active");const t=document.getElementById(`level${A}`);t&&t.classList.add("active"),p()}function w(){y=!0,document.getElementById("btn-shuffle")?.classList.add("active"),p()}function x(){y=!1,document.getElementById("btn-shuffle")?.classList.remove("active"),p()}function k(){const e=s.filter(o=>o.querySelector(".difficulty-badge")?.textContent==="D1").length,t=s.filter(o=>o.querySelector(".difficulty-badge")?.textContent==="D2").length,n=r==="all"?"All Difficulty":r,l=y?" (Shuffled)":"",c=document.getElementById("progressInfo");c&&(c.textContent=`${s.length===0?0:i+1}/${s.length} slides - Filter: ${n}${l} (Matches: D1=${e}, D2=${t})`)}function h(e){A=e,q();const t=e===4?B.timerDurations.theni4:B.timerDurations.theni3;document.querySelectorAll(".pill-button").forEach(a=>a.classList.remove("active"));const n=document.getElementById(`level${e}`);n&&n.classList.add("active");const l=document.getElementById(`filter${r==="all"?"All":r}`);l&&l.classList.add("active");const c=document.getElementById("timerLabel");c&&(c.textContent=`Timer (${t}s)`),g.setDuration(t);const o=document.getElementById("showTimer");o&&o.checked&&g.restart(),p(!0)}function u(){b.forEach(n=>{n.classList.remove("active"),n.style.display="none"}),s.forEach((n,l)=>{n.style.display=l===i?"flex":"none",l===i?n.classList.add("active"):n.classList.remove("revealed")}),document.getElementById("firstBtn").disabled=i===0,document.getElementById("prevBtn").disabled=i===0,document.getElementById("nextBtn").disabled=i===s.length-1,document.getElementById("lastBtn").disabled=i===s.length-1;const e=document.getElementById("counter");if(e&&(e.textContent=`${i+1} / ${s.length}`),D.updateProgress(i,s.length,"progressBar","counter"),k(),s[i]){const n=s[i].id.replace("slide-",""),l=`#${parseInt(n)+1}`;window.location.hash!==l&&window.history.replaceState(null,"",l)}const t=document.getElementById("showTimer");t&&t.checked&&g.restart()}function C(){s.length>0&&(i=0,u())}function $(){s.length>0&&(i=s.length-1,u())}function E(e){const t=i+e;t>=0&&t<s.length&&(i=t,u())}function v(){s[i]&&(s[i].classList.contains("revealed")?E(1):s[i].classList.add("revealed"))}function T(){const e=window.location.hash.substring(1),t=`slide-${parseInt(e)-1}`,n=s.findIndex(l=>l.id===t);n!==-1?(i=n,u()):s.length>0&&(i>=s.length&&(i=0),u())}function _(){P.init({title:"பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 3 & 4",contentHTML:`
            <div class="control-row">
                <span class="control-label">Level:</span>
                <div class="pill-group">
                    <button class="pill-button active" id="level3">Theni 3</button>
                    <button class="pill-button" id="level4">Theni 4</button>
                </div>
            </div>
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
                        <input type="checkbox" id="showTimer" checked> <span id="timerLabel">Timer (15s)</span>
                    </label>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Progress:</span>
                <span class="progress-info" id="progressInfo">Loading...</span>
            </div>
        `,timerDisplay:"00:15",injectNavigation:!0}),document.getElementById("cat-dropdown-btn")?.addEventListener("click",F),document.getElementById("select-all-cat-row")?.addEventListener("click",N),document.getElementById("level3")?.addEventListener("click",()=>h(3)),document.getElementById("level4")?.addEventListener("click",()=>h(4)),document.getElementById("filterAll")?.addEventListener("click",()=>f("all")),document.getElementById("filterD1")?.addEventListener("click",()=>f("D1")),document.getElementById("filterD2")?.addEventListener("click",()=>f("D2")),document.getElementById("btn-shuffle")?.addEventListener("click",w),document.getElementById("btn-reset-seq")?.addEventListener("click",x),document.getElementById("showTimer")?.addEventListener("change",g.toggleVisibility.bind(g)),document.getElementById("firstBtn")?.addEventListener("click",e=>{e.stopPropagation(),C()}),document.getElementById("prevBtn")?.addEventListener("click",e=>{e.stopPropagation(),E(-1)}),document.getElementById("nextBtn")?.addEventListener("click",e=>{e.stopPropagation(),v()}),document.getElementById("lastBtn")?.addEventListener("click",e=>{e.stopPropagation(),$()}),document.getElementById("slides-wrapper")?.addEventListener("click",e=>{e.target.closest("button")||v()}),document.addEventListener("keydown",e=>{e.key==="ArrowLeft"&&E(-1),(e.key==="ArrowRight"||e.key===" "||e.key==="Enter")&&v(),e.key==="Home"&&C(),e.key==="End"&&$(),e.key==="1"&&f("D1"),e.key==="2"&&f("D2"),(e.key==="a"||e.key==="A")&&f("all"),(e.key==="s"||e.key==="S")&&w(),(e.key==="r"||e.key==="R")&&x()}),window.addEventListener("hashchange",T),q(),H(),h(3),g.init(15),k(),window.location.hash?T():u()}document.addEventListener("DOMContentLoaded",_);
