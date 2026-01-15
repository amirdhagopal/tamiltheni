const c={shuffleArray:function(e){for(let t=e.length-1;t>0;t--){const i=Math.floor(Math.random()*(t+1));[e[t],e[i]]=[e[i],e[t]]}return e},updateProgress:function(e,t,i="progressBar",n="slideIndicator"){const a=t>0?t:1,s=(e+1)/a*100,o=document.getElementById(i);o&&(o.style.width=`${s}%`);const l=document.getElementById(n);l&&(l.innerText=`${e+1} / ${a}`)},saveLocal:(e,t)=>localStorage.setItem(e,t),getLocal:e=>localStorage.getItem(e)},u={duration:15,timeLeft:15,timerId:null,audioCtx:null,timerJustRestarted:!1,restartTimeoutId:null,isSilent:!1,elements:{btn:"timerBtn",pill:"timerPill",display:"timerDisplay",pie:"timerPie",checkbox:"showTimer",label:"timerLabel"},init:function(e=15){this.setDuration(e),this.updateDisplay(),this.toggleVisibility();const t=document.getElementById(this.elements.pill);t&&(t.style.cursor="pointer",t.onclick=n=>{this.timeLeft===0&&t.classList.contains("alarm")?this.reset():this.toggle(),n.stopPropagation()});const i=document.getElementById(this.elements.checkbox);i&&(i.onchange=()=>this.toggleVisibility()),this.setupAudioUnlock()},setDuration:function(e){this.duration=e,this.reset();const t=document.getElementById(this.elements.label);t&&t.innerText.includes("Timer")&&(t.innerText=`Timer (${e}s)`)},setSilent:function(e){this.isSilent=e},toggle:function(){const e=document.getElementById(this.elements.btn);this.timerId?this.pause():(this.timeLeft<=0&&this.reset(),this.timerId=setInterval(()=>this.tick(),1e3),e&&(e.innerText="⏸"))},pause:function(){const e=document.getElementById(this.elements.btn),t=document.getElementById(this.elements.pill);this.timerId&&(clearInterval(this.timerId),this.timerId=null,e&&(e.innerText="▶"),t&&t.classList.remove("alarm"))},reset:function(){this.timerId&&clearInterval(this.timerId),this.timerId=null,this.timeLeft=this.duration,this.updateDisplay();const e=document.getElementById(this.elements.btn);e&&(e.innerText="▶");const t=document.getElementById(this.elements.pill);t&&t.classList.remove("alarm")},restart:function(){this.restartTimeoutId&&clearTimeout(this.restartTimeoutId);const e=document.getElementById(this.elements.checkbox);if(e&&!e.checked){this.reset();return}this.timerJustRestarted=!0,this.reset(),this.toggle(),this.restartTimeoutId=setTimeout(()=>{this.timerJustRestarted=!1,this.restartTimeoutId=null},2e3)},tick:function(){this.timeLeft>0&&(this.timeLeft--,this.updateDisplay(),this.timeLeft>0&&this.timeLeft<=5&&!this.timerJustRestarted&&!this.isSilent&&this.playTickSound(),this.timeLeft===0&&this.triggerAlarm())},updateDisplay:function(){const e=Math.floor(this.timeLeft/60),t=this.timeLeft%60,i=document.getElementById(this.elements.display);i&&(i.innerText=`${e.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`);const n=document.getElementById(this.elements.pie);if(n){const a=this.timeLeft/this.duration*360;n.style.background=`conic-gradient(#667eea ${a}deg, #f0f0f0 0)`}},triggerAlarm:function(){this.timerId&&clearInterval(this.timerId),this.timerId=null;const e=document.getElementById(this.elements.btn);e&&(e.innerText="↺");const t=document.getElementById(this.elements.pill);t&&t.classList.add("alarm"),this.isSilent||this.playAlarmSound()},toggleVisibility:function(){const e=document.getElementById(this.elements.checkbox),t=document.getElementById(this.elements.pill);if(!e||!t)return;const i=e.checked;t.style.display=i?"flex":"none",i?this.restart():this.reset()},setupAudioUnlock:function(){const e=()=>{if(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx){const t=this.audioCtx.resume();t&&t.then(()=>{if(!this.audioCtx)return;const i=this.audioCtx.createBuffer(1,1,22050),n=this.audioCtx.createBufferSource();n.buffer=i,n.connect(this.audioCtx.destination),n.start(0)}).catch(console.warn)}document.removeEventListener("click",e),document.removeEventListener("keydown",e),document.removeEventListener("touchstart",e)};document.addEventListener("click",e),document.addEventListener("keydown",e),document.addEventListener("touchstart",e)},playTickSound:function(){if(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),!this.audioCtx)return;const e=this.audioCtx.sampleRate*.03,t=this.audioCtx.createBuffer(1,e,this.audioCtx.sampleRate),i=t.getChannelData(0);for(let o=0;o<e;o++)i[o]=(Math.random()*2-1)*Math.exp(-o/(e*.1));const n=this.audioCtx.createBufferSource();n.buffer=t;const a=this.audioCtx.createBiquadFilter();a.type="bandpass",a.frequency.value=3e3,a.Q.value=2;const s=this.audioCtx.createGain();s.gain.setValueAtTime(.4,this.audioCtx.currentTime),s.gain.exponentialRampToValueAtTime(.001,this.audioCtx.currentTime+.03),n.connect(a),a.connect(s),s.connect(this.audioCtx.destination),n.start()},playAlarmSound:function(){if(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),!this.audioCtx)return;const e=[523.25,659.25,783.99],t=.15,i=.6;e.forEach((n,a)=>{if(!this.audioCtx)return;const s=this.audioCtx.currentTime+a*t,o=this.audioCtx.createOscillator(),l=this.audioCtx.createGain();o.type="sine",o.frequency.setValueAtTime(n,s),l.gain.setValueAtTime(0,s),l.gain.linearRampToValueAtTime(.15,s+.05),l.gain.exponentialRampToValueAtTime(.01,s+i),o.connect(l),l.connect(this.audioCtx.destination),o.start(s),o.stop(s+i);const d=this.audioCtx.createOscillator(),r=this.audioCtx.createGain();d.type="sine",d.frequency.setValueAtTime(n*2,s),r.gain.setValueAtTime(0,s),r.gain.linearRampToValueAtTime(.03,s+.05),r.gain.exponentialRampToValueAtTime(.001,s+i),d.connect(r),r.connect(this.audioCtx.destination),d.start(s),d.stop(s+i)})}},h={init:function(e){this.injectControlPanel(e.title,e.contentHTML),this.injectCircularTimer(e.timerDisplay),e.injectNavigation&&this.injectNavigation(),this.injectKeyboardHelpModal(),this.setupGlobalKeyboardShortcuts()},injectControlPanel:function(e,t){const i=`
            <div class="control-panel" id="controlPanel">
                <div class="control-header" role="button" tabindex="0" aria-expanded="false" aria-controls="controlContent" title="Click to expand/collapse settings" onclick="const panel = document.getElementById('controlPanel'); const wasCollapsed = panel.classList.contains('collapsed'); panel.classList.toggle('collapsed'); this.setAttribute('aria-expanded', wasCollapsed); if (!wasCollapsed) { document.dispatchEvent(new CustomEvent('panelCollapsed')); }" onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); this.click(); }">
                    <h3><span aria-hidden="true">⚙️</span> ${e}</h3>
                    <span class="toggle-icon" aria-hidden="true">▼</span>
                </div>
                <div class="control-content" id="controlContent">
                    ${t}
                    <div class="control-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; display: flex; gap: 10px;">
                        <a href="../index.html" class="action-button" title="Return to main portal (H)" style="text-decoration: none; background: rgba(255,255,255,0.1); flex: 1; justify-content: center;">
                            <span aria-hidden="true">🏠</span> Back to Portal Home
                        </a>
                        <button class="action-button" id="showKeyboardHelp" title="Show keyboard shortcuts (?)" style="background: rgba(255,255,255,0.1); padding: 8px 12px;">
                            <span aria-hidden="true">⌨️</span> <span style="font-size: 0.85em;">?</span>
                        </button>
                    </div>
                </div>
            </div>
        `;document.body.insertAdjacentHTML("afterbegin",i)},injectCircularTimer:function(e="00:15"){const t=`
            <div class="circular-timer" id="timerPill" role="region" aria-label="Study Timer">
                <div class="timer-visual" id="timerPie" aria-hidden="true"></div>
                <div class="timer-content">
                    <span class="timer-display" id="timerDisplay" aria-live="off">${e}</span>
                    <button class="timer-btn" id="timerBtn" title="Play or Pause Timer" aria-label="Play or Pause Timer">
                        <span aria-hidden="true">▶</span>
                    </button>
                </div>
            </div>
        `;document.body.insertAdjacentHTML("beforeend",t)},injectNavigation:function(){const e=`
            <div class="navigation" role="navigation" aria-label="Slide Navigation">
                <button class="nav-btn" id="firstBtn" title="First slide (Home)" aria-label="First Slide">
                    <span aria-hidden="true">⏮</span>
                </button>
                <button class="nav-btn" id="prevBtn" title="Previous slide (←)" aria-label="Previous Slide">
                    <span aria-hidden="true">◀</span>
                </button>
                <span style="align-self: center; color: #757575; font-weight: 600; min-width: 80px; text-align: center;" id="counter" aria-live="polite"></span>
                <button class="nav-btn" id="nextBtn" title="Next slide (→ / Space / Enter)" aria-label="Next Slide">
                    <span aria-hidden="true">▶</span>
                </button>
                <button class="nav-btn" id="lastBtn" title="Last slide (End)" aria-label="Last Slide">
                    <span aria-hidden="true">⏭</span>
                </button>
            </div>
        `,t=document.querySelector(".slide-container");t&&t.insertAdjacentHTML("beforeend",e)},injectKeyboardHelpModal:function(){document.body.insertAdjacentHTML("beforeend",`
            <div class="keyboard-help-modal" id="keyboardHelpModal" role="dialog" aria-labelledby="keyboardHelpTitle" aria-hidden="true">
                <div class="keyboard-help-content">
                    <div class="keyboard-help-header">
                        <h2 id="keyboardHelpTitle">⌨️ Keyboard Shortcuts</h2>
                        <button class="keyboard-help-close" id="closeKeyboardHelp" title="Close (Escape)" aria-label="Close">&times;</button>
                    </div>
                    <div class="keyboard-help-body">
                        <div class="shortcut-section">
                            <h3>🧭 Navigation</h3>
                            <div class="shortcut-row"><kbd>H</kbd><span>Go to Home page</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+1</kbd><span>Go to Theni 1</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+2</kbd><span>Go to Theni 2</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+3</kbd><span>Go to Theni 3 & 4</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+5</kbd><span>Go to Theni 5</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>📖 Slides</h3>
                            <div class="shortcut-row"><kbd>←</kbd><span>Previous slide</span></div>
                            <div class="shortcut-row"><kbd>→</kbd> <kbd>Space</kbd> <kbd>Enter</kbd><span>Next / Reveal</span></div>
                            <div class="shortcut-row"><kbd>Home</kbd> / <kbd>[</kbd><span>First slide</span></div>
                            <div class="shortcut-row"><kbd>End</kbd> / <kbd>]</kbd><span>Last slide</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>🎛️ Actions & Filters</h3>
                            <div class="shortcut-row"><kbd>G</kbd><span>Generate Sentence (Theni 2)</span></div>
                            <div class="shortcut-row"><kbd>S</kbd><span>Shuffle slides</span></div>
                            <div class="shortcut-row"><kbd>R</kbd><span>Reset sequence</span></div>
                            <div class="shortcut-row"><kbd>1</kbd> / <kbd>2</kbd> / <kbd>A</kbd><span>Filter D1 / D2 / All</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>❓ Help & UI</h3>
                            <div class="shortcut-row"><kbd>?</kbd><span>Show this help</span></div>
                            <div class="shortcut-row"><kbd>Esc</kbd><span>Close modal / panel</span></div>
                            <div class="shortcut-row"><kbd>C</kbd><span>Toggle Control Panel</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .keyboard-help-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 10000;
                    align-items: center;
                    justify-content: center;
                }
                .keyboard-help-modal.show {
                    display: flex;
                }
                .keyboard-help-content {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 16px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .keyboard-help-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .keyboard-help-header h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 1.3em;
                    font-weight: 600;
                }
                .keyboard-help-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }
                .keyboard-help-close:hover {
                    color: #fff;
                }
                .keyboard-help-body {
                    padding: 20px 24px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                }
                .shortcut-section h3 {
                    color: #667eea;
                    font-size: 0.95em;
                    margin: 0 0 12px 0;
                    font-weight: 600;
                }
                .shortcut-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 0;
                    color: #ccc;
                    font-size: 0.9em;
                }
                .shortcut-row kbd {
                    background: linear-gradient(180deg, #3a3a4a 0%, #2a2a3a 100%);
                    border: 1px solid #555;
                    border-radius: 5px;
                    padding: 4px 8px;
                    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                    font-size: 0.85em;
                    color: #fff;
                    min-width: 24px;
                    text-align: center;
                    box-shadow: 0 2px 0 #222;
                }
                .shortcut-row span:last-child {
                    flex: 1;
                }
                @media (max-width: 500px) {
                    .keyboard-help-body {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `);const t=document.getElementById("keyboardHelpModal"),i=document.getElementById("closeKeyboardHelp"),n=document.getElementById("showKeyboardHelp");i&&t&&i.addEventListener("click",()=>{t.classList.remove("show"),t.setAttribute("aria-hidden","true")}),n&&t&&n.addEventListener("click",()=>{t.classList.add("show"),t.setAttribute("aria-hidden","false")}),t?.addEventListener("click",a=>{a.target===t&&(t.classList.remove("show"),t.setAttribute("aria-hidden","true"))})},setupGlobalKeyboardShortcuts:function(){const e=document.getElementById("keyboardHelpModal");document.addEventListener("keydown",t=>{const i=t.target;if(!(i.tagName==="INPUT"||i.tagName==="TEXTAREA")){if(t.key==="Escape"){if(e?.classList.contains("show")){e.classList.remove("show"),e.setAttribute("aria-hidden","true");return}const n=document.getElementById("controlPanel");if(n&&!n.classList.contains("collapsed")){n.classList.add("collapsed"),document.dispatchEvent(new CustomEvent("panelCollapsed"));return}}if(t.key==="?"||t.shiftKey&&t.key==="/"){t.preventDefault(),e&&(e.classList.add("show"),e.setAttribute("aria-hidden","false"));return}if(!e?.classList.contains("show")){if(t.key==="c"||t.key==="C"){const n=document.getElementById("controlPanel");if(n){const a=n.classList.contains("collapsed");n.classList.toggle("collapsed"),a||document.dispatchEvent(new CustomEvent("panelCollapsed"))}return}if(t.key==="h"||t.key==="H"){window.location.href="../index.html";return}if(t.ctrlKey||t.metaKey)switch(t.key){case"1":t.preventDefault(),window.location.href="../html/theni1.html";break;case"2":t.preventDefault(),window.location.href="../html/theni2.html";break;case"3":case"4":t.preventDefault(),window.location.href="../html/theni34.html";break;case"5":t.preventDefault(),window.location.href="../html/theni5.html";break}}}})}},p={timerDurations:{theni1:8,theni2:20,theni3:15,theni4:40,theni5:60},gemini:{defaultModel:"models/gemini-2.5-flash",baseUrl:"https://generativelanguage.googleapis.com/v1beta"}};export{h as L,u as T,c as U,p as c};
