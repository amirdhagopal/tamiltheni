import"./pwa-DOeEgxuH.js";import{L as P,T as g,c as w,U as D}from"./config-CembH8Ct.js";import{t as T}from"./theni_words-xXaqkVpm.js";let i=0,$=3,r="all",d=[],m=[],k=[],l=[],y=!1;function q(){const e=document.getElementById("slides-wrapper");e&&(e.innerHTML="",T.forEach((t,n)=>{const s=document.createElement("div");s.className=n===0?"slide active":"slide",s.id=`slide-${n}`;const a=t.sentence_en||t.word_en,o=t.sentence_ta||t.word_ta;s.innerHTML=`
            <div class="slide-content">
                <div class="slide-header">
                    <span class="category-badge">${t.category}</span>
                    <span class="category-badge-ta">${t.category_ta}</span>
                    <span class="difficulty-badge">${t.difficulty}</span>
                </div>
                <div class="slide-body">
                    <div class="word-en">${a}</div>
                    <div class="word-ta">${o}</div>
                </div>
            </div>
        `,e.appendChild(s)}),k=Array.from(document.querySelectorAll(".slide")))}function F(e){e.stopPropagation(),document.getElementById("categoryMenu")?.classList.toggle("show")}document.addEventListener("click",e=>{if(e.target.closest(".category-dropdown")||document.getElementById("categoryMenu")?.classList.remove("show"),!e.target.closest(".control-panel")){const t=document.getElementById("controlPanel");t&&!t.classList.contains("collapsed")&&t.classList.add("collapsed")}});function H(){const e=new Map;T.forEach(n=>{const s=`${n.category} - ${n.category_ta}`;e.has(s)||e.set(s,!0)}),m=Array.from(e.keys()),d=[...m];const t=document.getElementById("categoryList");t&&(t.innerHTML="",m.forEach(n=>{const s=document.createElement("div");s.className="dropdown-item";const a=document.createElement("input");a.type="checkbox",a.checked=!0,a.id=`cat-${n}`;const o=document.createElement("span");o.innerText=n,s.appendChild(a),s.appendChild(o),s.addEventListener("click",c=>{c.stopPropagation(),h(n)}),a.addEventListener("click",c=>{c.stopPropagation(),h(n)}),s.setAttribute("tabindex","0"),s.setAttribute("role","checkbox"),s.setAttribute("aria-checked","true"),s.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),h(n))}),t.appendChild(s)}),L())}function h(e){const t=d.indexOf(e);t>-1?d.splice(t,1):d.push(e);const n=document.getElementById(`cat-${e}`);n&&(n.checked=d.includes(e)),L(),p()}function N(e){const t=document.getElementById("selectAllCats");e.target!==t&&(t.checked=!t.checked);const n=t.checked;n?d=[...m]:d=[],document.querySelectorAll("#categoryList input").forEach(s=>{s.checked=n}),L(),p()}function L(){const e=document.getElementById("selectedCatText"),t=document.getElementById("selectAllCats");!e||!t||(d.length===m.length?(e.textContent="All Categories",t.checked=!0):d.length===0?(e.textContent="None selected",t.checked=!1):(e.textContent=`${d.length} selected`,t.checked=!1))}function p(e=!0){l=k.filter(t=>{const n=t.querySelector(".difficulty-badge")?.textContent,s=t.querySelector(".category-badge")?.textContent,a=t.querySelector(".category-badge-ta")?.textContent,o=`${s} - ${a}`,c=r==="all"||n===r,M=d.includes(o);return c&&M}),y&&D.shuffleArray(l),e&&(i=0),B(),u()}function f(e){r=e,document.querySelectorAll(".pill-button").forEach(s=>{s.classList.remove("active"),s.setAttribute("aria-pressed","false")});const t=document.getElementById(`filter${e==="all"?"All":e}`);t&&(t.classList.add("active"),t.setAttribute("aria-pressed","true"));const n=document.getElementById(`level${$}`);n&&(n.classList.add("active"),n.setAttribute("aria-pressed","true")),p()}function I(){y=!0;const e=document.getElementById("btn-shuffle");e&&(e.classList.add("active"),e.setAttribute("aria-pressed","true")),p()}function x(){y=!1;const e=document.getElementById("btn-shuffle");e&&(e.classList.remove("active"),e.setAttribute("aria-pressed","false")),p()}function B(){const e=l.filter(o=>o.querySelector(".difficulty-badge")?.textContent==="D1").length,t=l.filter(o=>o.querySelector(".difficulty-badge")?.textContent==="D2").length,n=r==="all"?"All Difficulty":r,s=y?" (Shuffled)":"",a=document.getElementById("progressInfo");a&&(a.textContent=`${l.length===0?0:i+1}/${l.length} slides - Filter: ${n}${s} (Matches: D1=${e}, D2=${t})`)}function v(e){$=e,q();const t=e===4?w.timerDurations.theni4:w.timerDurations.theni3;document.querySelectorAll(".pill-button").forEach(c=>{c.classList.remove("active"),c.setAttribute("aria-pressed","false")});const n=document.getElementById(`level${e}`);n&&(n.classList.add("active"),n.setAttribute("aria-pressed","true"));const s=document.getElementById(`filter${r==="all"?"All":r}`);s&&(s.classList.add("active"),s.setAttribute("aria-pressed","true"));const a=document.getElementById("timerLabel");a&&(a.textContent=`Timer (${t}s)`),g.setDuration(t);const o=document.getElementById("showTimer");o&&o.checked&&g.restart(),p(!0)}function u(){k.forEach(n=>{n.classList.remove("active"),n.style.display="none"}),l.forEach((n,s)=>{n.style.display=s===i?"flex":"none",s===i?n.classList.add("active"):n.classList.remove("revealed")}),document.getElementById("firstBtn").disabled=i===0,document.getElementById("prevBtn").disabled=i===0,document.getElementById("nextBtn").disabled=i===l.length-1,document.getElementById("lastBtn").disabled=i===l.length-1;const e=document.getElementById("counter");if(e&&(e.textContent=`${i+1} / ${l.length}`),D.updateProgress(i,l.length,"progressBar","counter"),B(),l[i]){const n=l[i].id.replace("slide-",""),s=`#${parseInt(n)+1}`;window.location.hash!==s&&window.history.replaceState(null,"",s)}const t=document.getElementById("showTimer");t&&t.checked&&g.restart()}function A(){l.length>0&&(i=0,u())}function C(){l.length>0&&(i=l.length-1,u())}function E(e){const t=i+e;t>=0&&t<l.length&&(i=t,u())}function b(){l[i]&&(l[i].classList.contains("revealed")?E(1):l[i].classList.add("revealed"))}function S(){const e=window.location.hash.substring(1),t=`slide-${parseInt(e)-1}`,n=l.findIndex(s=>s.id===t);n!==-1?(i=n,u()):l.length>0&&(i>=l.length&&(i=0),u())}function _(){P.init({title:"பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 3 & 4",contentHTML:`
            <div class="control-row">
                <span class="control-label">Level:</span>
                <div class="pill-group">
                    <button class="pill-button active" id="level3" title="Theni 3: Sentence reading (15s timer)" aria-pressed="true">Theni 3</button>
                    <button class="pill-button" id="level4" title="Theni 4: Advanced reading (40s timer)" aria-pressed="false">Theni 4</button>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Categories:</span>
                <div class="category-dropdown">
                    <button class="dropdown-button" id="cat-dropdown-btn" title="Select word categories to display">
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
                    <button class="pill-button active" id="filterAll" title="Show all difficulty levels" aria-pressed="true">All</button>
                    <button class="pill-button" id="filterD1" title="Show only Difficulty 1 sentences" aria-pressed="false">D1 Only</button>
                    <button class="pill-button" id="filterD2" title="Show only Difficulty 2 sentences" aria-pressed="false">D2 Only</button>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Sequence:</span>
                <div class="pill-group">
                    <button class="action-button" id="btn-shuffle" title="Randomize slide order" aria-pressed="false"><span aria-hidden="true">🔀</span> Shuffle</button>
                    <button class="action-button" id="btn-reset-seq" title="Reset to original order"><span aria-hidden="true">↩️</span> Reset</button>
                </div>
                <div style="margin-left: auto; display: flex; gap: 15px;">
                    <label title="Show/hide countdown timer" style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="showTimer" checked> <span id="timerLabel">Timer (15s)</span>
                    </label>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Progress:</span>
                <span class="progress-info" id="progressInfo">Loading...</span>
            </div>
        `,timerDisplay:"00:15",injectNavigation:!0}),document.getElementById("cat-dropdown-btn")?.addEventListener("click",F),document.getElementById("select-all-cat-row")?.addEventListener("click",N),document.getElementById("level3")?.addEventListener("click",()=>v(3)),document.getElementById("level4")?.addEventListener("click",()=>v(4)),document.getElementById("filterAll")?.addEventListener("click",()=>f("all")),document.getElementById("filterD1")?.addEventListener("click",()=>f("D1")),document.getElementById("filterD2")?.addEventListener("click",()=>f("D2")),document.getElementById("btn-shuffle")?.addEventListener("click",I),document.getElementById("btn-reset-seq")?.addEventListener("click",x),document.getElementById("showTimer")?.addEventListener("change",g.toggleVisibility.bind(g)),document.getElementById("firstBtn")?.addEventListener("click",e=>{e.stopPropagation(),A()}),document.getElementById("prevBtn")?.addEventListener("click",e=>{e.stopPropagation(),E(-1)}),document.getElementById("nextBtn")?.addEventListener("click",e=>{e.stopPropagation(),b()}),document.getElementById("lastBtn")?.addEventListener("click",e=>{e.stopPropagation(),C()}),document.getElementById("slides-wrapper")?.addEventListener("click",e=>{e.target.closest("button")||b()}),document.addEventListener("keydown",e=>{e.key==="ArrowLeft"&&E(-1),(e.key==="ArrowRight"||e.key===" "||e.key==="Enter")&&b(),e.key==="Home"&&A(),e.key==="End"&&C(),e.key==="1"&&f("D1"),e.key==="2"&&f("D2"),(e.key==="a"||e.key==="A")&&f("all"),(e.key==="s"||e.key==="S")&&I(),(e.key==="r"||e.key==="R")&&x()}),window.addEventListener("hashchange",S),q(),H(),v(3),g.init(15),B(),window.location.hash?S():u()}document.addEventListener("DOMContentLoaded",_);
