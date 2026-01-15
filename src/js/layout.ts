interface LayoutOptions {
    title: string;
    contentHTML: string;
    timerDisplay: string;
    injectNavigation?: boolean;
}

export const Layout = {
    init: function (options: LayoutOptions): void {
        this.injectControlPanel(options.title, options.contentHTML);
        this.injectCircularTimer(options.timerDisplay);
        // Navigation injection can be optional if page layout differs significantly
        if (options.injectNavigation) {
            this.injectNavigation();
        }
    },

    injectControlPanel: function (title: string, contentHTML: string): void {
        const panelStr = `
            <div class="control-panel" id="controlPanel">
                <div class="control-header" role="button" tabindex="0" aria-expanded="false" aria-controls="controlContent" title="Click to expand/collapse settings" onclick="const panel = document.getElementById('controlPanel'); const wasCollapsed = panel.classList.contains('collapsed'); panel.classList.toggle('collapsed'); this.setAttribute('aria-expanded', wasCollapsed); if (!wasCollapsed) { document.dispatchEvent(new CustomEvent('panelCollapsed')); }" onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); this.click(); }">
                    <h3><span aria-hidden="true">⚙️</span> ${title}</h3>
                    <span class="toggle-icon" aria-hidden="true">▼</span>
                </div>
                <div class="control-content" id="controlContent">
                    ${contentHTML}
                    <div class="control-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                        <a href="../index.html" class="action-button" title="Return to main portal" style="text-decoration: none; background: rgba(255,255,255,0.1); width: 100%; justify-content: center;">
                            <span aria-hidden="true">🏠</span> Back to Portal Home
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', panelStr);
    },

    injectCircularTimer: function (initialDisplay = '00:15'): void {
        const timerStr = `
            <div class="circular-timer" id="timerPill" role="region" aria-label="Study Timer">
                <div class="timer-visual" id="timerPie" aria-hidden="true"></div>
                <div class="timer-content">
                    <span class="timer-display" id="timerDisplay" aria-live="off">${initialDisplay}</span>
                    <button class="timer-btn" id="timerBtn" title="Play or Pause Timer" aria-label="Play or Pause Timer">
                        <span aria-hidden="true">▶</span>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', timerStr);
    },

    injectNavigation: function (): void {
        const navStr = `
            <div class="navigation" role="navigation" aria-label="Slide Navigation">
                <button class="nav-btn" id="firstBtn" title="Go to first slide" aria-label="First Slide">
                    <span aria-hidden="true">⏮</span>
                </button>
                <button class="nav-btn" id="prevBtn" title="Go to previous slide" aria-label="Previous Slide">
                    <span aria-hidden="true">◀</span>
                </button>
                <span style="align-self: center; color: #757575; font-weight: 600; min-width: 80px; text-align: center;" id="counter" aria-live="polite"></span>
                <button class="nav-btn" id="nextBtn" title="Go to next slide" aria-label="Next Slide">
                    <span aria-hidden="true">▶</span>
                </button>
                <button class="nav-btn" id="lastBtn" title="Go to last slide" aria-label="Last Slide">
                    <span aria-hidden="true">⏭</span>
                </button>
            </div>
        `;
        // Check if slide container exists to append to, otherwise append to body?
        // Usually navigation is inside .slide-container
        const container = document.querySelector('.slide-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', navStr);
        }
    },
};
