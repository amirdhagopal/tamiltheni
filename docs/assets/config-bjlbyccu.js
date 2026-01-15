const c={shuffleArray:function(t){for(let e=t.length-1;e>0;e--){const i=Math.floor(Math.random()*(e+1));[t[e],t[i]]=[t[i],t[e]]}return t},updateProgress:function(t,e,i="progressBar",n="slideIndicator"){const a=e>0?e:1,s=(t+1)/a*100,o=document.getElementById(i);o&&(o.style.width=`${s}%`);const d=document.getElementById(n);d&&(d.innerText=`${t+1} / ${a}`)},saveLocal:(t,e)=>localStorage.setItem(t,e),getLocal:t=>localStorage.getItem(t)},u={duration:15,timeLeft:15,timerId:null,audioCtx:null,timerJustRestarted:!1,restartTimeoutId:null,isSilent:!1,elements:{btn:"timerBtn",pill:"timerPill",display:"timerDisplay",pie:"timerPie",checkbox:"showTimer",label:"timerLabel"},init:function(t=15){this.setDuration(t),this.updateDisplay(),this.toggleVisibility();const e=document.getElementById(this.elements.btn);e&&(e.onclick=n=>{this.toggle(),n.stopPropagation()});const i=document.getElementById(this.elements.checkbox);i&&(i.onchange=()=>this.toggleVisibility()),this.setupAudioUnlock()},setDuration:function(t){this.duration=t,this.reset();const e=document.getElementById(this.elements.label);e&&e.innerText.includes("Timer")&&(e.innerText=`Timer (${t}s)`)},setSilent:function(t){this.isSilent=t},toggle:function(){const t=document.getElementById(this.elements.btn);this.timerId?this.pause():(this.timeLeft<=0&&this.reset(),this.timerId=setInterval(()=>this.tick(),1e3),t&&(t.innerText="⏸"))},pause:function(){const t=document.getElementById(this.elements.btn),e=document.getElementById(this.elements.pill);this.timerId&&(clearInterval(this.timerId),this.timerId=null,t&&(t.innerText="▶"),e&&e.classList.remove("alarm"))},reset:function(){this.timerId&&clearInterval(this.timerId),this.timerId=null,this.timeLeft=this.duration,this.updateDisplay();const t=document.getElementById(this.elements.btn);t&&(t.innerText="▶",t.onclick=i=>{this.toggle(),i.stopPropagation()});const e=document.getElementById(this.elements.pill);e&&e.classList.remove("alarm")},restart:function(){this.restartTimeoutId&&clearTimeout(this.restartTimeoutId);const t=document.getElementById(this.elements.checkbox);if(t&&!t.checked){this.reset();return}this.timerJustRestarted=!0,this.reset(),this.toggle(),this.restartTimeoutId=setTimeout(()=>{this.timerJustRestarted=!1,this.restartTimeoutId=null},2e3)},tick:function(){this.timeLeft>0&&(this.timeLeft--,this.updateDisplay(),this.timeLeft>0&&this.timeLeft<=5&&!this.timerJustRestarted&&!this.isSilent&&this.playTickSound(),this.timeLeft===0&&this.triggerAlarm())},updateDisplay:function(){const t=Math.floor(this.timeLeft/60),e=this.timeLeft%60,i=document.getElementById(this.elements.display);i&&(i.innerText=`${t.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`);const n=document.getElementById(this.elements.pie);if(n){const a=this.timeLeft/this.duration*360;n.style.background=`conic-gradient(#667eea ${a}deg, #f0f0f0 0)`}},triggerAlarm:function(){this.timerId&&clearInterval(this.timerId),this.timerId=null;const t=document.getElementById(this.elements.btn);t&&(t.innerText="↺",t.onclick=i=>{this.reset(),i.stopPropagation()});const e=document.getElementById(this.elements.pill);e&&e.classList.add("alarm"),this.isSilent||this.playAlarmSound()},toggleVisibility:function(){const t=document.getElementById(this.elements.checkbox),e=document.getElementById(this.elements.pill);if(!t||!e)return;const i=t.checked;e.style.display=i?"flex":"none",i?this.restart():this.reset()},setupAudioUnlock:function(){const t=()=>{if(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx){const e=this.audioCtx.resume();e&&e.then(()=>{if(!this.audioCtx)return;const i=this.audioCtx.createBuffer(1,1,22050),n=this.audioCtx.createBufferSource();n.buffer=i,n.connect(this.audioCtx.destination),n.start(0)}).catch(console.warn)}document.removeEventListener("click",t),document.removeEventListener("keydown",t),document.removeEventListener("touchstart",t)};document.addEventListener("click",t),document.addEventListener("keydown",t),document.addEventListener("touchstart",t)},playTickSound:function(){if(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),!this.audioCtx)return;const t=this.audioCtx.sampleRate*.03,e=this.audioCtx.createBuffer(1,t,this.audioCtx.sampleRate),i=e.getChannelData(0);for(let o=0;o<t;o++)i[o]=(Math.random()*2-1)*Math.exp(-o/(t*.1));const n=this.audioCtx.createBufferSource();n.buffer=e;const a=this.audioCtx.createBiquadFilter();a.type="bandpass",a.frequency.value=3e3,a.Q.value=2;const s=this.audioCtx.createGain();s.gain.setValueAtTime(.4,this.audioCtx.currentTime),s.gain.exponentialRampToValueAtTime(.001,this.audioCtx.currentTime+.03),n.connect(a),a.connect(s),s.connect(this.audioCtx.destination),n.start()},playAlarmSound:function(){if(this.audioCtx||(this.audioCtx=new(window.AudioContext||window.webkitAudioContext)),this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),!this.audioCtx)return;const t=[523.25,659.25,783.99],e=.15,i=.6;t.forEach((n,a)=>{if(!this.audioCtx)return;const s=this.audioCtx.currentTime+a*e,o=this.audioCtx.createOscillator(),d=this.audioCtx.createGain();o.type="sine",o.frequency.setValueAtTime(n,s),d.gain.setValueAtTime(0,s),d.gain.linearRampToValueAtTime(.15,s+.05),d.gain.exponentialRampToValueAtTime(.01,s+i),o.connect(d),d.connect(this.audioCtx.destination),o.start(s),o.stop(s+i);const l=this.audioCtx.createOscillator(),r=this.audioCtx.createGain();l.type="sine",l.frequency.setValueAtTime(n*2,s),r.gain.setValueAtTime(0,s),r.gain.linearRampToValueAtTime(.03,s+.05),r.gain.exponentialRampToValueAtTime(.001,s+i),l.connect(r),r.connect(this.audioCtx.destination),l.start(s),l.stop(s+i)})}},h={init:function(t){this.injectControlPanel(t.title,t.contentHTML),this.injectCircularTimer(t.timerDisplay),t.injectNavigation&&this.injectNavigation(),this.injectKeyboardHelpModal(),this.setupGlobalKeyboardShortcuts()},injectControlPanel:function(t,e){const i=`
            <div class="control-panel" id="controlPanel">
                <div class="control-header" role="button" tabindex="0" aria-expanded="false" aria-controls="controlContent" title="Click to expand/collapse settings" onclick="const panel = document.getElementById('controlPanel'); const wasCollapsed = panel.classList.contains('collapsed'); panel.classList.toggle('collapsed'); this.setAttribute('aria-expanded', wasCollapsed); if (!wasCollapsed) { document.dispatchEvent(new CustomEvent('panelCollapsed')); }" onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); this.click(); }">
                    <h3><span aria-hidden="true">⚙️</span> ${t}</h3>
                    <span class="toggle-icon" aria-hidden="true">▼</span>
                </div>
                <div class="control-content" id="controlContent">
                    ${e}
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
        `;document.body.insertAdjacentHTML("afterbegin",i)},injectCircularTimer:function(t="00:15"){const e=`
            <div class="circular-timer" id="timerPill" role="region" aria-label="Study Timer">
                <div class="timer-visual" id="timerPie" aria-hidden="true"></div>
                <div class="timer-content">
                    <span class="timer-display" id="timerDisplay" aria-live="off">${t}</span>
                    <button class="timer-btn" id="timerBtn" title="Play or Pause Timer" aria-label="Play or Pause Timer">
                        <span aria-hidden="true">▶</span>
                    </button>
                </div>
            </div>
        `;document.body.insertAdjacentHTML("beforeend",e)},injectNavigation:function(){const t=`
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
        `,e=document.querySelector(".slide-container");e&&e.insertAdjacentHTML("beforeend",t)},injectKeyboardHelpModal:function(){document.body.insertAdjacentHTML("beforeend",`
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
                            <div class="shortcut-row"><kbd>Home</kbd><span>First slide</span></div>
                            <div class="shortcut-row"><kbd>End</kbd><span>Last slide</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>🎛️ Filters</h3>
                            <div class="shortcut-row"><kbd>1</kbd><span>Filter D1 only</span></div>
                            <div class="shortcut-row"><kbd>2</kbd><span>Filter D2 only</span></div>
                            <div class="shortcut-row"><kbd>A</kbd><span>Show all difficulties</span></div>
                            <div class="shortcut-row"><kbd>S</kbd><span>Shuffle slides</span></div>
                            <div class="shortcut-row"><kbd>R</kbd><span>Reset sequence</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>❓ Help</h3>
                            <div class="shortcut-row"><kbd>?</kbd><span>Show this help</span></div>
                            <div class="shortcut-row"><kbd>Esc</kbd><span>Close modal</span></div>
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
        `);const e=document.getElementById("keyboardHelpModal"),i=document.getElementById("closeKeyboardHelp"),n=document.getElementById("showKeyboardHelp");i&&e&&i.addEventListener("click",()=>{e.classList.remove("show"),e.setAttribute("aria-hidden","true")}),n&&e&&n.addEventListener("click",()=>{e.classList.add("show"),e.setAttribute("aria-hidden","false")}),e?.addEventListener("click",a=>{a.target===e&&(e.classList.remove("show"),e.setAttribute("aria-hidden","true"))})},setupGlobalKeyboardShortcuts:function(){const t=document.getElementById("keyboardHelpModal");document.addEventListener("keydown",e=>{const i=e.target;if(!(i.tagName==="INPUT"||i.tagName==="TEXTAREA")){if(e.key==="Escape"&&t?.classList.contains("show")){t.classList.remove("show"),t.setAttribute("aria-hidden","true");return}if(e.key==="?"||e.shiftKey&&e.key==="/"){e.preventDefault(),t&&(t.classList.add("show"),t.setAttribute("aria-hidden","false"));return}if(!t?.classList.contains("show")){if(e.key==="h"||e.key==="H"){window.location.href="../index.html";return}if(e.ctrlKey||e.metaKey)switch(e.key){case"1":e.preventDefault(),window.location.href="../html/theni1.html";break;case"2":e.preventDefault(),window.location.href="../html/theni2.html";break;case"3":case"4":e.preventDefault(),window.location.href="../html/theni34.html";break;case"5":e.preventDefault(),window.location.href="../html/theni5.html";break}}}})}},p={timerDurations:{theni1:8,theni2:20,theni3:15,theni4:40,theni5:60},gemini:{defaultModel:"models/gemini-2.5-flash",baseUrl:"https://generativelanguage.googleapis.com/v1beta"}};export{h as L,u as T,c as U,p as c};
