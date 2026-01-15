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
        // Inject keyboard help modal
        this.injectKeyboardHelpModal();
        // Setup global keyboard shortcuts for page navigation
        this.setupGlobalKeyboardShortcuts();
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
        `;
        // Check if slide container exists to append to, otherwise append to body?
        // Usually navigation is inside .slide-container
        const container = document.querySelector('.slide-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', navStr);
        }
    },

    injectKeyboardHelpModal: function (): void {
        const modalStr = `
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
        `;
        document.body.insertAdjacentHTML('beforeend', modalStr);

        // Setup modal event listeners
        const modal = document.getElementById('keyboardHelpModal');
        const closeBtn = document.getElementById('closeKeyboardHelp');
        const showBtn = document.getElementById('showKeyboardHelp');

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            });
        }

        if (showBtn && modal) {
            showBtn.addEventListener('click', () => {
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
            });
        }

        // Close on click outside
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    },

    setupGlobalKeyboardShortcuts: function (): void {
        const modal = document.getElementById('keyboardHelpModal');

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // Escape to close modal
            if (e.key === 'Escape' && modal?.classList.contains('show')) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                return;
            }

            // ? to show help modal
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                if (modal) {
                    modal.classList.add('show');
                    modal.setAttribute('aria-hidden', 'false');
                }
                return;
            }

            // Don't trigger other shortcuts if modal is open
            if (modal?.classList.contains('show')) {
                return;
            }

            // H = Go to Home page
            if (e.key === 'h' || e.key === 'H') {
                window.location.href = '../index.html';
                return;
            }

            // Ctrl+Number shortcuts for navigation to specific Theni pages
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        window.location.href = '../html/theni1.html';
                        break;
                    case '2':
                        e.preventDefault();
                        window.location.href = '../html/theni2.html';
                        break;
                    case '3':
                    case '4':
                        e.preventDefault();
                        window.location.href = '../html/theni34.html';
                        break;
                    case '5':
                        e.preventDefault();
                        window.location.href = '../html/theni5.html';
                        break;
                }
            }
        });
    },
};
