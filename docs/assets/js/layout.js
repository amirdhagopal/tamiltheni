(function () {
    'use strict';

    const TheniLayout = {
        init: function (options) {
            this.injectControlPanel(options.title, options.contentHTML);
            this.injectCircularTimer(options.timerDisplay);
            // Navigation injection can be optional if page layout differs significantly
            if (options.injectNavigation) {
                this.injectNavigation();
            }
        },

        injectControlPanel: function (title, contentHTML) {
            const panelStr = `
                <div class="control-panel" id="controlPanel">
                    <div class="control-header" onclick="toggleControlPanel()">
                        <h3><span>⚙️</span> ${title}</h3>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div class="control-content">
                        ${contentHTML}
                        <div class="control-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                            <a href="index.html" class="action-button" style="text-decoration: none; background: rgba(255,255,255,0.1); width: 100%; justify-content: center;">
                                <span>🏠</span> Back to Portal Home
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('afterbegin', panelStr);
        },

        injectCircularTimer: function (initialDisplay = '00:15') {
            const timerStr = `
                <div class="circular-timer" id="timerPill" title="Study Timer">
                    <div class="timer-visual" id="timerPie"></div>
                    <div class="timer-content">
                        <span class="timer-display" id="timerDisplay">${initialDisplay}</span>
                        <button class="timer-btn" id="timerBtn" onclick="toggleTimer(); event.stopPropagation();">▶</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', timerStr);
        },

        injectNavigation: function () {
            const navStr = `
                <div class="navigation">
                    <button class="nav-btn" id="firstBtn" onclick="goToFirst(); event.stopPropagation();" title="First Slide (Home)">⏮</button>
                    <button class="nav-btn" id="prevBtn" onclick="changeSlide(-1); event.stopPropagation();" title="Previous Slide (←)">◀</button>
                    <span style="align-self: center; color: #757575; font-weight: 600; min-width: 80px; text-align: center;" id="counter"></span>
                    <button class="nav-btn" id="nextBtn" onclick="handleNextAction(); event.stopPropagation();" title="Next / Reveal (→, Space)">▶</button>
                    <button class="nav-btn" id="lastBtn" onclick="goToLast(); event.stopPropagation();" title="Last Slide (End)">⏭</button>
                </div>
            `;
            // Check if slide container exists to append to, otherwise append to body?
            // Usually navigation is inside .slide-container
            const container = document.querySelector('.slide-container');
            if (container) {
                container.insertAdjacentHTML('beforeend', navStr);
            }
        }
    };

    window.TheniLayout = TheniLayout;

})();
